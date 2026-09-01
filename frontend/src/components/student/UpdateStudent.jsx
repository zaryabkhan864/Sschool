// src/components/admin/UpdateStudent.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Redux
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useGetUserByTypeQuery,
} from "../../redux/api/authApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";
import { useTransferStudentMutation } from "../../redux/api/studentEnrollment";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import AvatarUpload from "../GUI/AvatarUpload";
import StatusSelect from "../GUI/StatusSelect";            // ✅ account status dropdown
import SearchableDropdown from "../layout/SearchableDropdown";
import { useGetAcademicYearsListQuery } from "../../redux/api/academicYearApi";
import { useGetClassGroupsQuery } from "../../redux/api/classGroupApi";
import moment from "moment";

// ✅ Helper: model has no "name" field, build from parts
const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const UpdateStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { countries } = useCountries();

  // ===================== STUDENT DETAILS =====================
  const { data, isLoading: detailsLoading, refetch: refetchDetails } =
    useGetUserDetailsQuery(params?.id, {
      refetchOnMountOrArgChange: true,
    });

  const [updateUser, { isLoading, error, isSuccess }] = useUpdateUserMutation();

  // ===================== CAMPUS =====================
  const [campusSearchTerm, setCampusSearchTerm] = useState("");
  const { data: campusesData, isFetching: campusesLoading } = useGetCampusQuery({
    limit: 0,
    keyword: campusSearchTerm,
  });

  const campusOptions = useMemo(() => {
    const campuses = campusesData?.campuses || [];
    return campuses.map((c) => ({
      value: c._id,
      label: c.name,
      subtitle: c.address,
    }));
  }, [campusesData]);

  // ===================== STUDENT STATE =====================
  const [student, setStudent] = useState({
    role: "student",
    firstName: "",
    middleName: "",
    lastName: "",
    fatherName: "",       // ✅ added
    motherName: "",       // ✅ added
    age: "",                             // display only, removed before submit
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    nationalID: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    campus: "",
    accountStatus: "pending",           // ✅ replaced invalid "status" field
    email: "",
    password: "",
    avatar: "",
    siblings: [],
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    firstName,
    middleName,
    lastName,
    fatherName,       // ✅ added
    motherName,       // ✅ added
    age,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    nationalID,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    campus,
    accountStatus,
    email,
    password,
    siblings,
  } = student;

  // ===================== TRANSFER MODAL =====================
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    newCampusId: "",
    newClassGroupId: "",
    academicYearId: "",
    transferDate: moment().format("YYYY-MM-DD"),
  });
  const [classGroupSearch, setClassGroupSearch] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  const [transferStudent] = useTransferStudentMutation();

  const { data: academicYearsData } = useGetAcademicYearsListQuery({
    limit: 0,
    sort: "-createdAt",
  });

  const { data: classGroupsData, isFetching: classGroupsLoading } =
    useGetClassGroupsQuery({
      status: "active",
      paginate: "false",
      keyword: classGroupSearch,
    });

  const academicYearOptions = useMemo(
    () =>
      (academicYearsData?.academicYears || []).map((y) => ({
        value: y._id,
        label: y.name,
      })),
    [academicYearsData]
  );

  const classGroupOptions = useMemo(
    () =>
      (classGroupsData?.classGroups || []).map((g) => ({
        value: g._id,
        label: g.displayName || `${g.grade?.gradeName || ""} ${g.section || ""}`,
      })),
    [classGroupsData]
  );

  // ===================== SIBLINGS =====================
  const [siblingSearchTerm, setSiblingSearchTerm] = useState("");
  const [siblingSearchResults, setSiblingSearchResults] = useState([]);
  const { data: siblingData, isFetching: siblingLoading } = useGetUserByTypeQuery(
    { type: "student", keyword: siblingSearchTerm, dropdown: true },
    { skip: siblingSearchTerm.length < 2 }
  );

  useEffect(() => {
    if (siblingData?.users) {
      const alreadySelectedIds = new Set(siblings);
      const available = siblingData.users.filter(
        (u) => !alreadySelectedIds.has(u._id)
      );
      setSiblingSearchResults(available);
    } else {
      setSiblingSearchResults([]);
    }
  }, [siblingData, siblings]);

  // ===================== AGE CALCULATION =====================
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge.toString();
  };

  // ===================== POPULATE FROM FETCHED DATA =====================
  useEffect(() => {
    if (data?.user) {
      const userData = data.user;
      let formattedDate = "";
      if (userData.dateOfBirth) {
        try {
          const dateObj = new Date(userData.dateOfBirth);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const day = String(dateObj.getDate()).padStart(2, "0");
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (e) {}
      }

      let siblingIds = [];
      if (Array.isArray(userData.siblings)) {
        siblingIds = userData.siblings.map((sib) =>
          typeof sib === "object" ? sib._id : sib
        );
      }

      setStudent({
        role: "student",
        firstName: userData.firstName || "",
        middleName: userData.middleName || "",
        lastName: userData.lastName || "",
        fatherName: userData.fatherName || "",   // ✅ added
        motherName: userData.motherName || "",   // ✅ added
        age: formattedDate ? calculateAgeFromDOB(formattedDate) : "",
        dateOfBirth: formattedDate,
        gender: userData.gender
          ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1).toLowerCase()
          : "",
        nationality: userData.nationality || "",
        passportNumber: userData.passportNumber || "",
        nationalID: userData.nationalID || "",
        phoneNumber: userData.phoneNumber?.replace(/\+/g, "") || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber?.replace(/\+/g, "") || "",
        address: userData.address || "",
        campus: userData.campus?._id || userData.campus || "",
        accountStatus: userData.accountStatus || "pending",   // ✅ correct field
        email: userData.email || "",
        password: "",
        avatar: userData.avatar?.url || "",
        siblings: siblingIds,
      });
      setAvatarPreview(userData.avatar?.url || "");
    }
  }, [data]);

  // ===================== HANDLERS =====================
  const onChange = (e) => {
    // Some custom components may pass value directly, not an event
    if (e && e.target) {
      const { name, value, type, files, checked } = e.target;
      if (name === "avatar") {
        const file = files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setAvatarPreview(reader.result);
            setStudent((prev) => ({ ...prev, avatar: reader.result }));
          }
        };
        reader.readAsDataURL(file);
      } else if (name === "dateOfBirth") {
        setStudent((prev) => ({
          ...prev,
          dateOfBirth: value,
          age: calculateAgeFromDOB(value),
        }));
      } else {
        let newValue;
        if (type === "checkbox") newValue = checked;
        else newValue = value;
        setStudent((prev) => ({ ...prev, [name]: newValue }));
      }
    } else {
      // Direct value from StatusSelect etc.
      setStudent((prev) => ({ ...prev, accountStatus: e }));
    }
  };

  const addSibling = (studentId) => {
    if (siblings.includes(studentId)) {
      toast.error(t("Student already added as sibling"));
      return;
    }
    setStudent((prev) => ({
      ...prev,
      siblings: [...prev.siblings, studentId],
    }));
    setSiblingSearchTerm("");
  };

  const removeSibling = (studentId) => {
    setStudent((prev) => ({
      ...prev,
      siblings: prev.siblings.filter((id) => id !== studentId),
    }));
  };

  // ===================== UPDATE STUDENT =====================
  const submitHandler = async (e) => {
    e.preventDefault();

    // ✅ Validate all required fields per backend schema
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !dateOfBirth ||
      !gender ||
      !nationality ||
      !phoneNumber.trim()
    ) {
      return toast.error(t("Please fill all required fields"));
    }

    const submitData = {
      ...student,
      gender: gender.toLowerCase(),          // model enum lowercase
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
      age: undefined,                         // not a model field
      // accountStatus already correct; ensure it's lowercase
      accountStatus: accountStatus.toLowerCase(),
    };

    if (!submitData.password) delete submitData.password;
    if (submitData.avatar && submitData.avatar.startsWith("http")) delete submitData.avatar;
    delete submitData.status;                 // ensure no leftover "status" key

    const result = await updateUser({ id: params?.id, body: submitData });
    if (result?.data?.success) {
      toast.success(t("Student updated successfully"));
      navigate("/admin/students");
      refetchDetails();
    }
  };

  // ===================== TRANSFER HANDLER =====================
  const handleTransfer = async () => {
    if (!transferData.academicYearId || !transferData.newCampusId || !transferData.newClassGroupId || !transferData.transferDate) {
      return toast.error(t("Please fill all transfer fields"));
    }
    setTransferLoading(true);
    try {
      await transferStudent({
        studentId: params.id,
        newCampusId: transferData.newCampusId,
        newClassGroupId: transferData.newClassGroupId,
        academicYearId: transferData.academicYearId,
        transferDate: new Date(transferData.transferDate).toISOString(),
      }).unwrap();
      toast.success(t("Student transferred successfully"));
      setShowTransferModal(false);
      refetchDetails();
      setStudent((prev) => ({ ...prev, campus: transferData.newCampusId }));
    } catch (err) {
      toast.error(err?.data?.message || t("Transfer failed"));
    } finally {
      setTransferLoading(false);
    }
  };

  // ===================== EFFECTS =====================
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error updating student"));
  }, [error]);

  if (detailsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">{t("Loading...")}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MetaData title={t("Update Student")} />

      <style>{`
        :root { --theme-color: #ec4899; }
        input[type="checkbox"], input[type="radio"] {
          accent-color: var(--theme-color) !important;
        }
        .react-tel-input .form-control:focus {
          border-color: var(--theme-color) !important;
          box-shadow: 0 0 0 1px var(--theme-color) !important;
        }
        ::selection { background: var(--theme-color); color: white; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update Student")}
          subtitle={t("Edit student information or perform a mid‑year transfer")}
          backUrl="/admin/students"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* ===== Student Credentials ===== */}
          <AppCard title={t("Student Credentials")} icon="fa-lock">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AppInput
                label={t("First Name")}
                name="firstName"
                value={firstName}
                onChange={onChange}
                required
                maxLength={25}                // ✅ match model
              />
              <AppInput
                label={t("Middle Name")}
                name="middleName"
                value={middleName}
                onChange={onChange}
                maxLength={25}                // ✅ match model
              />
              <AppInput
                label={t("Last Name")}
                name="lastName"
                value={lastName}
                onChange={onChange}
                required
                maxLength={50}                // ✅ match model
              />
            </div>

            {/* ✅ Parent Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <AppInput
                label={t("Father Name")}
                name="fatherName"
                value={fatherName}
                onChange={onChange}
                maxLength={50}
                placeholder={t("Optional")}
              />
              <AppInput
                label={t("Mother Name")}
                name="motherName"
                value={motherName}
                onChange={onChange}
                maxLength={50}
                placeholder={t("Optional")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <AppInput
                label={t("Email Address")}
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
              <AppInput
                label={t("Password")}
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder={t("Leave blank to keep current")}
                minLength="6"
              />
              {/* ✅ Replaced status checkbox with account status dropdown */}
              <StatusSelect
                name="accountStatus"
                value={accountStatus}
                onChange={onChange}
              />
            </div>
          </AppCard>

          {/* ===== Academic & Personal Details ===== */}
          <AppCard
            title={t("Academic & Personal Details")}
            icon="fa-graduation-cap"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/students" />
                <AppButton
                  type="submit"
                  label={t("Update Student")}
                  loadingLabel={t("Updating...")}
                  isLoading={isLoading}
                  icon="fa-user-pen"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GenderRadio value={gender} onChange={onChange} />
              <AppInput
                label={t("Date of Birth")}
                type="date"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={onChange}
                required
                max={moment().subtract(4, "years").format("YYYY-MM-DD")}
              />
              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={age}
                readOnly
                helperText={t("Auto-calculated")}
              />
              <NationalitySelect value={nationality} onChange={onChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <AppInput
                label={t("Passport No")}
                name="passportNumber"
                value={passportNumber}
                onChange={onChange}
                placeholder={t("Min 6 characters")}   // ✅ correct min length
                maxLength={20}                         // ✅ match model
              />
              <AppInput
                label={t("National ID")}
                name="nationalID"
                value={nationalID}
                onChange={onChange}
                placeholder={t("Min 11 Max 20 digits")}
                maxLength={20}                         // ✅ match model
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Primary Contact")} <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  country={"tr"}
                  value={phoneNumber}
                  onChange={(val) => setStudent((prev) => ({ ...prev, phoneNumber: val }))}
                  inputProps={{ maxLength: 13 }}       // ✅ backend max 13
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase">
                  {t("Emergency Contact")}
                </label>
                <PhoneInput
                  country={"tr"}
                  value={secondaryPhoneNumber}
                  onChange={(val) => setStudent((prev) => ({ ...prev, secondaryPhoneNumber: val }))}
                  inputProps={{ maxLength: 13 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg"
                  containerClass="!w-full"
                />
              </div>
            </div>

            {/* Campus field with transfer button */}
            <div className="mt-6 flex items-end gap-3">
              <div className="flex-1">
                <SearchableDropdown
                  label={t("Campus")}
                  placeholder={t("Search campus...")}
                  value={campus}
                  onChange={(val) => setStudent({ ...student, campus: val })}
                  onSearch={setCampusSearchTerm}
                  options={campusOptions}
                  isLoading={campusesLoading}
                  helperText={t("Select the student's campus")}
                  emptyMessage={t("No campuses found")}
                  loadingMessage={t("Loading campuses...")}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition mb-0.5"
              >
                <i className="fa fa-exchange-alt mr-2"></i>
                {t("Transfer")}
              </button>
            </div>

            {/* Siblings */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i className="fa fa-users text-gray-400"></i>
                {t("Siblings (Optional)")}
              </h3>
              <AppInput
                label={t("Search for a student")}
                placeholder={t("Type at least 2 characters...")}
                value={siblingSearchTerm}
                onChange={(e) => setSiblingSearchTerm(e.target.value)}
              />
              {siblingSearchTerm.length >= 2 && siblingSearchResults.length > 0 && (
                <ul className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow-sm">
                  {siblingSearchResults.map((s) => (
                    <li
                      key={s._id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between text-sm"
                      onClick={() => addSibling(s._id)}
                    >
                      <span>{getFullName(s)}</span>      {/* ✅ display built name */}
                      <span className="text-gray-400 text-xs">{s.email}</span>
                    </li>
                  ))}
                </ul>
              )}
              {siblings.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {siblings.map((id) => {
                    const sib = siblingData?.users?.find((u) => u._id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {sib ? getFullName(sib) : id}
                        <button
                          type="button"
                          onClick={() => removeSibling(id)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <i className="fa fa-times-circle"></i>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Avatar & Address */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <AvatarUpload
                preview={avatarPreview}
                onChange={onChange}
                title={t("Student Picture")}
                subtitle={t("Max size 2MB")}
              />
              <AppInput
                label={t("Residential Address")}
                name="address"
                value={address}
                onChange={onChange}
                type="textarea"
                rows={2}
              />
            </div>
          </AppCard>
        </form>
      </div>

      {/* ===================== TRANSFER MODAL (Inline) ===================== */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <i className="fa fa-times text-xl"></i>
            </button>

            <h2 className="text-xl font-bold mb-4">{t("Mid‑Year Transfer")}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t("This will close the current active enrollment and create a new one at the destination campus.")}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Academic Year")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferData.academicYearId}
                  onChange={(e) => setTransferData({ ...transferData, academicYearId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                >
                  <option value="">{t("Select Academic Year")}</option>
                  {academicYearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <SearchableDropdown
                label={t("New Campus")}
                value={transferData.newCampusId}
                onChange={(val) => setTransferData({ ...transferData, newCampusId: val })}
                onSearch={setCampusSearchTerm}
                options={campusOptions}
                isLoading={campusesLoading}
                placeholder={t("Select campus")}
                required
              />

              <SearchableDropdown
                label={t("New Class Group")}
                value={transferData.newClassGroupId}
                onChange={(val) => setTransferData({ ...transferData, newClassGroupId: val })}
                onSearch={setClassGroupSearch}
                options={classGroupOptions}
                isLoading={classGroupsLoading}
                placeholder={t("Select class group")}
                required
              />

              <AppInput
                label={t("Transfer Date (last day at old campus)")}
                type="date"
                name="transferDate"
                value={transferData.transferDate}
                onChange={(e) => setTransferData({ ...transferData, transferDate: e.target.value })}
                required
                max={moment().format("YYYY-MM-DD")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <AppButton type="button" onClick={() => setShowTransferModal(false)} label={t("Cancel")} />
              <AppButton
                type="button"
                onClick={handleTransfer}
                label={t("Confirm Transfer")}
                loadingLabel={t("Transferring...")}
                isLoading={transferLoading}
                icon="fa-exchange-alt"
                className="bg-orange-500 hover:bg-orange-600"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UpdateStudent;