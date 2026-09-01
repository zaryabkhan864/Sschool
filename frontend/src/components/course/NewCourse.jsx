import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux API
import { useCreateCourseMutation } from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";

// Core UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppInfoBox from "../layout/AppInfoBox";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const NewCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state
  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
  });

  const [teacherSearch, setTeacherSearch] = useState("");

  const { courseName, description, code, teacher } = course;

  // Mutations & Queries
  const [createCourse, { isLoading: isCreating, error, isSuccess }] =
    useCreateCourseMutation();

  // ✅ Only fetch teachers who are contracted AND have accountStatus = "active"
  const { data: teachersData, isFetching: teachersLoading } =
    useGetUserByTypeQuery({
      type: "teacher",
      contracted: true,      // only contracted teachers
      status: "active",      // 👈 only active accounts
      limit: 0,              // fetch all (dropdown mode)
      keyword: teacherSearch,
    });

  // Handle side effects
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating course"));
    }
    if (isSuccess) {
      toast.success(t("Course Created Successfully"));
      navigate("/admin/courses");
    }
  }, [error, isSuccess, navigate, t]);

  // Handlers
  const onChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!courseName.trim() || code.length !== 8 || !teacher) {
      return toast.error(t("Please fill all required fields correctly"));
    }

    createCourse(course);
  };

  // ✅ Teacher dropdown options with status as subtitle
  const teacherOptions = useMemo(() => {
    return (teachersData?.users || []).map((user) => {
      const fullName = getFullName(user) || user.email;
      const statusLabel = user.status
        ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
        : "";
      return {
        value: user._id,
        label: fullName,
        subtitle: statusLabel,   // status will show as subtitle
      };
    });
  }, [teachersData]);

  return (
    <AdminLayout>
      <MetaData title={t("New Course")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Course")}
          subtitle={t("Define a new course and assign a teacher")}
          backUrl="/admin/courses"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard
            title={t("Course Information")}
            icon="fa-book"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/courses" />
                <AppButton
                  type="submit"
                  label={t("Create Course")}
                  loadingLabel={t("Creating...")}
                  isLoading={isCreating}
                  icon="fa-plus-circle"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Name */}
              <AppInput
                name="courseName"
                value={courseName}
                onChange={onChange}
                label={t("Course Name")}
                placeholder={t("e.g. Mathematics, Physics")}
                required
              />

              {/* Course Code */}
              <AppInput
                name="code"
                value={code}
                onChange={onChange}
                label={t("Course Code")}
                placeholder={t("e.g. MATH101")}
                maxLength={8}
                required
              />

              {/* Teacher Dropdown - full width */}
              <div className="md:col-span-2">
                <SearchableDropdown
                  label={t("Assigned Teacher")}
                  value={teacher}
                  options={teacherOptions}
                  onChange={(val) => setCourse((prev) => ({ ...prev, teacher: val }))}
                  onSearch={setTeacherSearch}
                  placeholder={t("Select Teacher")}
                  isLoading={teachersLoading}
                  required
                />
              </div>

              {/* Description - full width */}
              <div className="md:col-span-2">
                <AppInput
                  type="textarea"
                  name="description"
                  value={description}
                  onChange={onChange}
                  label={t("Description")}
                  placeholder={t("Enter course description")}
                  rows={3}
                />
              </div>
            </div>

            {/* Informational note */}
            <AppInfoBox icon="fa-info-circle">
              <strong>{t("Note")}:</strong> - {t("Course code must be exactly 8 characters.\nThe teacher must be active and will be assigned to this course.")}<br />
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewCourse;