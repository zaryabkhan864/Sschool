import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useGetUserDetailsQuery, useUpdateUserMutation } from "../../redux/api/authApi";
import {
  useTransferEmployeeMutation,
  useTerminateContractMutation,
  useGetEmployeeContractHistoryQuery,
} from "../../redux/api/employeeContractApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import GenderRadio from "../GUI/GenderRadio";
import NationalitySelect from "../GUI/NationalitySelect";
import StatusSelect from "../GUI/StatusSelect";
import AvatarUpload from "../GUI/AvatarUpload";
import TransferModal from "../GUI/TransferModal";
import TerminateContractModal from "../GUI/TerminateContractModal";

import ContractHistory from "./ContractHistory";
import EmploymentActions from "./EmploymentActions";

const UpdateTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { data, isLoading: detailsLoading, refetch: refetchDetails } =
    useGetUserDetailsQuery(params?.id);
  const [updateUser, { isLoading, error, isSuccess }] = useUpdateUserMutation();

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

  const [transferEmployee] = useTransferEmployeeMutation();
  const [terminateContract] = useTerminateContractMutation();

  const activeContract = data?.user?.currentContract || null;
  const currentUserStatus = data?.user?.accountStatus || "";

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useGetEmployeeContractHistoryQuery({ employeeId: params.id });

  const allContracts = historyData?.contracts || [];

  const [teacher, setTeacher] = useState({
    role: "teacher",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    nationalID: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    email: "",
    password: "",
    address: "",
    avatar: "",
    accountStatus: "",
    campus: "",
  });

  const [ageDisplay, setAgeDisplay] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  const {
    firstName, middleName, lastName, dateOfBirth, gender,
    passportNumber, nationalID, nationality, phoneNumber,
    secondaryPhoneNumber, email, password, address, accountStatus, campus,
  } = teacher;

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  };

  useEffect(() => {
    if (data?.user) {
      const u = data.user;
      let formattedDate = "";
      if (u.dateOfBirth) {
        try {
          const d = new Date(u.dateOfBirth);
          if (!isNaN(d.getTime())) {
            formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          }
        } catch (e) {}
      }
      setAgeDisplay(calculateAgeFromDOB(u.dateOfBirth));
      setTeacher({
        role: "teacher",
        firstName: u.firstName || "",
        middleName: u.middleName || "",
        lastName: u.lastName || "",
        dateOfBirth: formattedDate,
        gender: u.gender
          ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1).toLowerCase()
          : "",
        passportNumber: u.passportNumber || "",
        nationalID: u.nationalID || "",
        nationality: u.nationality || "",
        phoneNumber: u.phoneNumber ? u.phoneNumber.replace(/\+/g, "") : "",
        secondaryPhoneNumber: u.secondaryPhoneNumber ? u.secondaryPhoneNumber.replace(/\+/g, "") : "",
        email: u.email || "",
        password: "",
        address: u.address || "",
        avatar: u.avatar?.url || "",
        accountStatus: u.accountStatus || "",
        campus: u.campus?._id || u.campus || "",
      });
      setAvatarPreview(u.avatar?.url || "");
    }
  }, [data]);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error updating teacher"));
    if (isSuccess) {
      toast.success(t("Teacher Updated Successfully"));
      navigate("/admin/teachers");
      refetchDetails();
    }
  }, [error, isSuccess]);

  const onChange = (e) => {
    if (e && e.target) {
      const { name, value, files } = e.target;
      if (name === "avatar") {
        const file = files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setAvatarPreview(reader.result);
            setTeacher((prev) => ({ ...prev, avatar: reader.result }));
          }
        };
        reader.readAsDataURL(file);
      } else if (name === "dateOfBirth") {
        setAgeDisplay(calculateAgeFromDOB(value));
        setTeacher((prev) => ({ ...prev, dateOfBirth: value }));
      } else {
        setTeacher((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      // Direct value from StatusSelect
      setTeacher((prev) => ({ ...prev, accountStatus: e }));
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // ✅ Extended required‑field validation (matches backend schema)
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !dateOfBirth ||
      !gender ||
      !phoneNumber.trim()   // phoneNumber is stored without "+"
    ) {
      return toast.error(t("Please fill all required fields"));
    }

    const updateData = { ...teacher };
    // Phone numbers already stored without +, add it back for submission
    updateData.phoneNumber = phoneNumber ? `+${phoneNumber}` : "";
    updateData.secondaryPhoneNumber = secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "";
    updateData.gender = gender ? gender.toLowerCase() : "";
    if (!updateData.password) delete updateData.password;
    if (updateData.avatar && updateData.avatar.startsWith("http")) delete updateData.avatar;
    if (updateData.accountStatus) {
      updateData.accountStatus = updateData.accountStatus.toLowerCase();
    }
    updateUser({ id: params?.id, body: updateData });
  };

  const handleTransferClose = () => {
    setIsTransferOpen(false);
    refetchDetails();
    refetchHistory();
  };

  const handleTerminateClose = () => {
    setIsTerminateOpen(false);
    refetchDetails();
    refetchHistory();
  };

  const campusDisplay =
    campusOptions.find((c) => c.value === campus)?.label || campus || t("Not assigned");

  const isContractExpired = useMemo(() => {
    if (!activeContract?.endDate) return false;
    return new Date(activeContract.endDate) < new Date();
  }, [activeContract]);

  const transferCampusOptions = useMemo(() => {
    if (!campus) return campusOptions;
    return campusOptions.filter(opt => opt.value !== campus);
  }, [campusOptions, campus]);

  const isMismatchUserInactiveContractActive = useMemo(() => {
    if (!activeContract || activeContract.accountStatus !== "active") return false;
    const userStatusLower = (currentUserStatus || "").toLowerCase();
    const inactiveStatuses = ["inactive", "suspended", "leave", "pending"];
    return inactiveStatuses.includes(userStatusLower);
  }, [activeContract, currentUserStatus]);

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
      <MetaData title={t("Update Teacher")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update Teacher")}
          subtitle={t("Update faculty member information")}
          backUrl="/admin/teachers"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* ─── Credentials Card (footer removed) ─── */}
          <AppCard title={t("Account Credentials")} icon="fa-id-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AppInput
                label={t("First Name")}
                name="firstName"
                value={firstName}
                onChange={onChange}
                required
                maxLength={25}
              />
              <AppInput
                label={t("Middle Name")}
                name="middleName"
                value={middleName}
                onChange={onChange}
                maxLength={25}
              />
              <AppInput
                label={t("Last Name")}
                name="lastName"
                value={lastName}
                onChange={onChange}
                required
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <AppInput
                label={t("Email")}
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
                placeholder={t("Leave blank to keep unchanged")}
              />
              <StatusSelect
                name="accountStatus"
                value={accountStatus}
                onChange={onChange}
              />
            </div>
          </AppCard>

          {/* ─── Personal Information Card (footer added with buttons) ─── */}
          <AppCard
            title={t("Personal Information")}
            icon="fa-user"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/teachers" />
                <AppButton
                  type="submit"
                  label={t("Update Teacher")}
                  loadingLabel={t("Updating...")}
                  isLoading={isLoading}
                  icon="fa-user-pen"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GenderRadio value={gender} onChange={onChange} />
              <AppInput
                label={t("Date of Birth")}
                type="date"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={onChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]}
              />
              <AppInput
                label={t("Age")}
                type="number"
                name="age"
                value={ageDisplay}
                readOnly
                helperText={t("Auto-calculated")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <NationalitySelect value={nationality} onChange={onChange} />
              <AppInput
                label={t("Passport No")}
                name="passportNumber"
                value={passportNumber}
                onChange={onChange}
                placeholder={t("Min 6 characters")}
                maxLength={20}
              />
              <AppInput
                label={t("National ID")}
                name="nationalID"
                value={nationalID}
                onChange={onChange}
                placeholder={t("Min 11 Max 20 digits")}
                maxLength={20}
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
                  onChange={(val) => setTeacher((p) => ({ ...p, phoneNumber: val }))}
                  inputProps={{ maxLength: 13 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg focus:!border-brand-500 focus:!ring-2 focus:!ring-brand-500/20 focus:!shadow-none"
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
                  onChange={(val) => setTeacher((p) => ({ ...p, secondaryPhoneNumber: val }))}
                  inputProps={{ maxLength: 13 }}
                  inputClass="!w-full !h-[38px] !text-sm !border-gray-300 !rounded-lg focus:!border-brand-500 focus:!ring-2 focus:!ring-brand-500/20 focus:!shadow-none"
                  containerClass="!w-full"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <AvatarUpload
                preview={avatarPreview}
                onChange={onChange}
                title={t("Teacher Picture")}
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

          {/* Warning when user is inactive but contract is active */}
          {isMismatchUserInactiveContractActive && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex items-start gap-3">
                <i className="fa fa-exclamation-triangle text-yellow-500 mt-0.5"></i>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {t("User is currently")} <strong className="capitalize">{currentUserStatus}</strong>{" "}
                    {t("but their contract is still")} <strong>{t("active")}</strong>.
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t("If the teacher should not have an active contract, please terminate the contract before or after updating the accountStatus.")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contract History */}
          <ContractHistory
            contracts={allContracts}
            isLoading={historyLoading}
            currentUserStatus={currentUserStatus}
            showMismatchWarning={isMismatchUserInactiveContractActive}
          />

          {/* Employment Actions */}
          <EmploymentActions
            campusLabel={campusDisplay}
            activeContract={activeContract}
            isContractExpired={isContractExpired}
            currentUserStatus={currentUserStatus}
            onTransferClick={() => setIsTransferOpen(true)}
            onTerminateClick={() => activeContract && setIsTerminateOpen(true)}
          />
        </form>
      </div>

      <TransferModal
        isOpen={isTransferOpen}
        onClose={handleTransferClose}
        employeeId={params.id}
        transferEmployee={transferEmployee}
        campusOptions={transferCampusOptions}
        campusesLoading={campusesLoading}
        onCampusSearch={setCampusSearchTerm}
        activeContract={activeContract}
      />

      <TerminateContractModal
        isOpen={isTerminateOpen}
        onClose={handleTerminateClose}
        activeContract={activeContract}
        terminateContract={terminateContract}
      />
    </AdminLayout>
  );
};

export default UpdateTeacher;