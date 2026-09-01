import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetCourseDetailsQuery, useUpdateCourseMutation } from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";
import AppInfoBox from "../layout/AppInfoBox";
import Loader from "../layout/Loader";

// ✅ User model has no `name` field — only firstName/middleName/lastName
const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const UpdateCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
  });

  const [teacherSearch, setTeacherSearch] = useState("");

  const { courseName, description, code, teacher } = course;

  // ── API queries ───────────────────────────────────────────────────────────
  const {
    data: courseData,
    isLoading: courseLoading,
    error: fetchError,
  } = useGetCourseDetailsQuery(id);

  const [updateCourse, { isLoading: isUpdating, error: updateError, isSuccess }] =
    useUpdateCourseMutation();

  // ✅ CHANGED: Only fetch teachers who are currently contracted
  const { data: teachersData, isFetching: teachersLoading } = useGetUserByTypeQuery({
    type: "teacher",
    contracted: true,   // 👈 show only contracted teachers
    limit: 0,
    keyword: teacherSearch,
  });

  // ── Prefill form when course data arrives ─────────────────────────────────
  useEffect(() => {
    if (courseData?.course) {
      const c = courseData.course;

      setCourse({
        courseName: c.courseName || "",
        description: c.description || "",
        code: c.code || "",
        teacher: c.teacher?._id || c.teacher || "",
      });
    }
  }, [courseData]);

  // ── Side effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError?.data?.message || t("Error loading course"));
    }
  }, [fetchError, t]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError?.data?.message || t("Error updating course"));
    }
    if (isSuccess) {
      toast.success(t("Course Updated Successfully"));
      navigate("/admin/courses");
    }
  }, [updateError, isSuccess, navigate, t]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!courseName.trim()) {
      return toast.error(t("Course name is required"));
    }
    if (code.length !== 9) {
      return toast.error(t("Course code must be exactly 9 characters"));
    }
    updateCourse({ id, courseName, description, code, teacher });
  };

  // ── Teacher dropdown options (now shows status) ───────────────────────────
  const teacherOptions = useMemo(
    () =>
      (teachersData?.users || []).map((user) => {
        const fullName = getFullName(user) || user.email;
        const statusLabel = user.status
          ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
          : "";
        return {
          value: user._id,
          label: fullName,
          subtitle: statusLabel,   // ✅ status as subtitle
        };
      }),
    [teachersData]
  );

  if (courseLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Update Course")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("Update Course")}
          subtitle={t("Edit course information and teacher assignment")}
          backUrl="/admin/courses"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <AppCard
            title={t("Course Information")}
            icon="fa-book"
            footer={
              <div className="flex justify-end gap-3">
                <AppButton backUrl="/admin/courses" label={t("Cancel")} />
                <AppButton
                  type="submit"
                  label={t("Update Course")}
                  loadingLabel={t("Updating...")}
                  isLoading={isUpdating}
                  icon="fa-save"
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
                maxLength={9}
                required
              />

              {/* Teacher Dropdown — full width */}
              <div className="md:col-span-2">
                <SearchableDropdown
                  label={t("Assigned Teacher")}
                  value={teacher}
                  options={teacherOptions}
                  onChange={(val) =>
                    setCourse((prev) => ({ ...prev, teacher: val }))
                  }
                  onSearch={setTeacherSearch}
                  placeholder={t("Select Teacher")}
                  isLoading={teachersLoading}
                  required
                />
              </div>

              {/* Description — full width */}
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

            <AppInfoBox icon="fa-info-circle">
              <strong>{t("Note")}:</strong> —{" "}
              {t(
                "Course code must be exactly 9 characters. The teacher must be active and will be assigned to this course."
              )}
            </AppInfoBox>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateCourse;