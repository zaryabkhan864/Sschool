// src/components/admin/UpdateStudentEnrollment.jsx
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux APIs
import {
  useGetUserByTypeQuery,
  useGetUserDetailsQuery,
} from "../../redux/api/authApi";
import { useGetAcademicYearsListQuery } from "../../redux/api/academicYearApi";
import { useGetClassGroupsQuery } from "../../redux/api/classGroupApi";
import {
  useCreateStudentEnrollmentMutation,
  useUpdateStudentEnrollmentMutation,
  useGetStudentEnrollmentDetailsQuery,
} from "../../redux/api/studentEnrollment";
import { useGetCampusQuery } from "../../redux/api/campusApi";

// Core UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppInput from "../GUI/AppInput";
import Loader from "../layout/Loader";

const UpdateStudentEnrollment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const studentIdFromUrl = searchParams.get("studentId");
  const enrollmentIdFromUrl = searchParams.get("enrollmentId");

  // Determine mode: edit if enrollmentId exists, else create
  const isEditMode = Boolean(enrollmentIdFromUrl);

  // ================== LOCAL STATE ==================
  const [enrollment, setEnrollment] = useState({
    student: studentIdFromUrl || "",
    academicYear: "",
    classGroup: "",
    campus: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [academicYearSearch, setAcademicYearSearch] = useState("");
  const [classGroupSearch, setClassGroupSearch] = useState("");
  const [campusSearch, setCampusSearch] = useState("");

  const { student, academicYear, classGroup, campus, startDate, endDate, status } = enrollment;

  // ================== MUTATIONS & QUERIES ==================
  const [createEnrollment, { isLoading: isCreating, error: createError, isSuccess: createSuccess }] =
    useCreateStudentEnrollmentMutation();

  const [
    updateEnrollment,
    { isLoading: isUpdating, error: updateError, isSuccess: updateSuccess },
  ] = useUpdateStudentEnrollmentMutation();

  // For edit mode: fetch existing enrollment
  const {
    data: enrollmentDetails,
    isLoading: enrollmentLoading,
    error: fetchError,
  } = useGetStudentEnrollmentDetailsQuery(enrollmentIdFromUrl, {
    skip: !isEditMode,
  });

  // Pre‑selected student name (only if studentIdFromUrl present)
  const { data: studentDetailsData, isLoading: studentDetailsLoading } =
    useGetUserDetailsQuery(studentIdFromUrl, { skip: !studentIdFromUrl });

  const selectedStudentName = studentDetailsData?.user
    ? `${studentDetailsData.user.firstName || ""} ${studentDetailsData.user.middleName || ""} ${studentDetailsData.user.lastName || ""}`.trim()
    : "";

  // Dropdown data
  const { data: studentsData, isFetching: studentsLoading } = useGetUserByTypeQuery(
    {
      type: "student",
      status: "active",
      limit: 0,
      keyword: studentSearch,
    },
    { skip: isEditMode || !!studentIdFromUrl }
  );

  const { data: academicYearsData, isFetching: academicYearsLoading } =
    useGetAcademicYearsListQuery({ limit: 0, sort: "-createdAt", keyword: academicYearSearch });

  const { data: classGroupsData, isFetching: classGroupsLoading } =
    useGetClassGroupsQuery({ status: "active", paginate: "false", keyword: classGroupSearch });

  const { data: campusesData, isFetching: campusesLoading } =
    useGetCampusQuery({ limit: 0, keyword: campusSearch });

  // ================== POPULATE FORM IN EDIT MODE ==================
  useEffect(() => {
    if (isEditMode && enrollmentDetails?.enrollment) {
      const en = enrollmentDetails.enrollment;
      const formatDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
      setEnrollment({
        student: en.student?._id || en.student,
        academicYear: en.academicYear?._id || en.academicYear,
        classGroup: en.classGroup?._id || en.classGroup,
        campus: en.campus?._id || en.campus || "",
        startDate: formatDate(en.startDate),
        endDate: formatDate(en.endDate),
        status: en.status || "active",
      });
    }
  }, [enrollmentDetails, isEditMode]);

  // ================== MUTATION CALLBACKS ==================
  useEffect(() => {
    if (createError) toast.error(createError?.data?.message || t("Error creating enrollment"));
    if (updateError) toast.error(updateError?.data?.message || t("Error updating enrollment"));
    if (createSuccess || updateSuccess) {
      toast.success(t("Enrollment saved successfully"));
      navigate("/admin/studentenrollements");
    }
  }, [createError, updateError, createSuccess, updateSuccess, navigate, t]);

  useEffect(() => {
    if (fetchError) toast.error(fetchError?.data?.message || t("Could not load enrollment"));
  }, [fetchError, t]);

  // ================== HANDLERS ==================
  const onChange = (field, value) => {
    setEnrollment((prev) => ({ ...prev, [field]: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    // Validation
    if (!student || !academicYear || !classGroup || !startDate) {
      return toast.error(t("Please fill all required fields"));
    }
    if (status !== "active" && !endDate) {
      return toast.error(t("Non‑active enrollments must have an end date"));
    }

    const payload = { ...enrollment };
    // Remove empty fields if not needed
    if (payload.campus === "") delete payload.campus;
    if (isEditMode) {
      // Don't send student & academicYear in update (protected)
      updateEnrollment({ id: enrollmentIdFromUrl, ...payload });
    } else {
      createEnrollment(payload);
    }
  };

  // ================== DROPDOWN OPTIONS ==================
  const studentOptions = useMemo(
    () =>
      (studentsData?.users || []).map((user) => ({
        value: user._id,
        label: `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`.trim() || user.email,
        subtitle: user.email,
      })),
    [studentsData]
  );

  const academicYearOptions = useMemo(
    () =>
      (academicYearsData?.academicYears || []).map((year) => ({
        value: year._id,
        label: year.name,
        subtitle: year.description,
      })),
    [academicYearsData]
  );

  const classGroupOptions = useMemo(
    () =>
      (classGroupsData?.classGroups || []).map((group) => ({
        value: group._id,
        label: group.displayName || `${group.grade?.gradeName || ""} ${group.section || ""}`,
        subtitle: group.academicLevel?.name,
      })),
    [classGroupsData]
  );

  const campusOptions = useMemo(
    () =>
      (campusesData?.campuses || []).map((c) => ({
        value: c._id,
        label: c.name,
        subtitle: c.address,
      })),
    [campusesData]
  );

  if (enrollmentLoading && isEditMode) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={isEditMode ? t("Edit Enrollment") : t("New Student Enrollment")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={isEditMode ? t("Edit Enrollment") : t("New Student Enrollment")}
          subtitle={
            isEditMode
              ? t("Update enrollment details, dates, or class group")
              : t("Enroll a student for an academic year")
          }
          backUrl="/admin/studentenrollements"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard
            title={t("Enrollment Information")}
            icon="fa-user-graduate"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/studentenrollements" />
                <AppButton
                  type="submit"
                  label={isEditMode ? t("Update Enrollment") : t("Create Enrollment")}
                  loadingLabel={t("Saving...")}
                  isLoading={isEditMode ? isUpdating : isCreating}
                  icon="fa-save"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student field */}
              <div className="md:col-span-2">
                {studentIdFromUrl || isEditMode ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Student")} <span className="text-red-500">*</span>
                    </label>
                    <AppInput
                      value={isEditMode ? enrollmentDetails?.enrollment?.student?.name || enrollment.student : selectedStudentName}
                      disabled
                      className="bg-gray-100 rounded-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t("Student is pre‑selected")}</p>
                  </div>
                ) : (
                  <SearchableDropdown
                    label={t("Student")}
                    value={student}
                    options={studentOptions}
                    onChange={(val) => onChange("student", val)}
                    onSearch={setStudentSearch}
                    placeholder={t("Select Student")}
                    isLoading={studentsLoading}
                    required
                  />
                )}
              </div>

              {/* Academic Year */}
              <SearchableDropdown
                label={t("Academic Year")}
                value={academicYear}
                options={academicYearOptions}
                onChange={(val) => onChange("academicYear", val)}
                onSearch={setAcademicYearSearch}
                placeholder={t("Select Academic Year")}
                isLoading={academicYearsLoading}
                required
                disabled={isEditMode} // academic year cannot be changed on update
              />

              {/* Class Group */}
              <SearchableDropdown
                label={t("Class Group")}
                value={classGroup}
                options={classGroupOptions}
                onChange={(val) => onChange("classGroup", val)}
                onSearch={setClassGroupSearch}
                placeholder={t("Select Class Group")}
                isLoading={classGroupsLoading}
                required
              />

              {/* Campus */}
              <SearchableDropdown
                label={t("Campus")}
                value={campus}
                options={campusOptions}
                onChange={(val) => onChange("campus", val)}
                onSearch={setCampusSearch}
                placeholder={t("Select Campus (optional)")}
                isLoading={campusesLoading}
              />

              {/* Start Date */}
              <AppInput
                label={t("Start Date")}
                type="date"
                name="startDate"
                value={startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                required
              />

              {/* End Date (visible when status not active, or always for edit) */}
              <AppInput
                label={t("End Date")}
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => onChange("endDate", e.target.value)}
                helperText={t("Required if status is not active")}
                disabled={status === "active"}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Status")}</label>
              <select
                value={status}
                onChange={(e) => onChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="active">{t("Active")}</option>
                <option value="transferred">{t("Transferred")}</option>
                <option value="completed">{t("Completed")}</option>
                <option value="left">{t("Left")}</option>
              </select>
            </div>

            <AppInfoBox icon="fa-info-circle" className="mt-6">
              <strong>{t("Note")}:</strong>{" "}
              {t("Overlapping enrollments for the same student and academic year are not allowed.")}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateStudentEnrollment;