import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Redux
import {
  useGetCounselingDetailsQuery,
  useUpdateCounselingMutation,
} from "../../redux/api/counselingApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";
import Loader from "../layout/Loader";

// Helper function to get full name from user object
const getFullName = (user) => {
  if (!user) return "";
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ");
};

// Helper to safely extract year display value
const getYearDisplay = (yearValue) => {
  if (!yearValue) return "—";
  if (typeof yearValue === "string") return yearValue;
  if (typeof yearValue === "object") {
    return yearValue.year ? yearValue.year : yearValue._id?.toString() || "—";
  }
  return String(yearValue);
};

// Small pill toggle switch (same style as scholarship toggle)
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <span
      onClick={() => onChange(!checked)}
      className={
        "rounded-full p-0.5 transition-colors flex items-center " +
        (checked ? "bg-red-600 justify-end" : "bg-gray-300 justify-start")
      }
      style={{ width: 40, height: 22 }}
    >
      <span className="bg-white rounded-full shadow" style={{ width: 18, height: 18 }} />
    </span>
  </label>
);

const UpdateStudentCounseling = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // ------------------ Fetch counseling details ------------------
  const {
    data: detailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useGetCounselingDetailsQuery(id);

  // ------------------ Teacher involvement state ------------------
  const [involveTeacher, setInvolveTeacher] = useState(false);
  const [teacher, setTeacher] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  // Fetch teachers only if involveTeacher is true
  const {
    data: teachersData,
    isFetching: teachersLoading,
  } = useGetUserByTypeQuery(
    {
      type: "teacher",
      contracted: true,
      status: "active",
      limit: 0,
      keyword: teacherSearchTerm,
    },
    { skip: !involveTeacher }
  );

  const teacherOptions = useMemo(() => {
    if (!teachersData?.users) return [];
    return teachersData.users.map((user) => ({
      value: user._id,
      label: getFullName(user) || user.email,
    }));
  }, [teachersData]);

  // ------------------ Issue type options ------------------
  const issueTypeOptions = [
    { value: "Fighting", label: t("Fighting") },
    { value: "Misbehavior", label: t("Misbehavior") },
    { value: "Academic", label: t("Academic") },
    { value: "Attendance", label: t("Attendance") },
    { value: "Bullying", label: t("Bullying") },
    { value: "Personal issue", label: t("Personal Issue") },
    { value: "Other", label: t("Other") },
  ];

  // ------------------ Status options ------------------
  const statusOptions = [
    { value: "pending", label: t("Pending") },
    { value: "under_review", label: t("Under Review") },
    { value: "resolved", label: t("Resolved") },
    { value: "closed", label: t("Closed") },
  ];

  // ------------------ Form state ------------------
  const [formData, setFormData] = useState({
    student: "",
    issueType: "",
    complainDescription: "",
    incidentDate: "",
    actionTaken: "",
    status: "pending",
    teacherComment: "",
    counselorComment: "",
    principalComment: "",
  });

  const [originalData, setOriginalData] = useState(null);

  // Populate form when details arrive
  useEffect(() => {
    if (detailsData?.counseling) {
      const c = detailsData.counseling;
      const initial = {
        student: c.student?._id || "",
        issueType: c.issueType || "",
        complainDescription: c.complainDescription || "",
        incidentDate: c.incidentDate
          ? new Date(c.incidentDate).toISOString().split("T")[0]
          : "",
        actionTaken: c.actionTaken || "",
        status: c.status || "pending",
        teacherComment: c.teacherComment?.text || "",
        counselorComment: c.counselorComment?.text || "",
        principalComment: c.principalComment?.text || "",
        teacher: c.teacher?._id || "",
        involveTeacher: !!c.teacher,
      };
      setFormData(initial);
      setOriginalData(initial);
      // Set teacher involvement states
      setInvolveTeacher(!!c.teacher);
      setTeacher(c.teacher?._id || "");
    }
  }, [detailsData]);

  // Handle errors and success
  const [updateCounseling, { isLoading: updating, error: updateError, isSuccess }] =
    useUpdateCounselingMutation();

  useEffect(() => {
    if (detailsError) {
      toast.error(detailsError?.data?.message || t("Error loading counseling"));
      navigate("/admin/counselings");
    }
    if (updateError) {
      toast.error(updateError?.data?.message || t("Error updating counseling"));
    }
    if (isSuccess) {
      toast.success(t("Counseling updated successfully"));
      navigate("/admin/counselings");
    }
  }, [detailsError, updateError, isSuccess, navigate, t, id]);

  // ------------------ Form change handler ------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------ Toggle teacher involvement ------------------
  const toggleTeacherInvolvement = (nextValue) => {
    setInvolveTeacher(nextValue);
    if (!nextValue) {
      // If removing teacher, clear selection and comment
      setTeacher("");
      setTeacherSearchTerm("");
      setFormData((prev) => ({ ...prev, teacherComment: "" }));
    }
  };

  // ------------------ Submit handler (only changed fields) ------------------
  const submitHandler = (e) => {
    e.preventDefault();

    if (!formData.issueType) {
      toast.error(t("Please select an issue type"));
      return;
    }
    if (!formData.complainDescription?.trim()) {
      toast.error(t("Please describe the complaint"));
      return;
    }
    if (involveTeacher && !teacher) {
      toast.error(t("Please select a teacher to involve"));
      return;
    }

    const payload = {};

    if (formData.issueType !== originalData?.issueType) {
      payload.issueType = formData.issueType;
    }
    if (formData.complainDescription !== originalData?.complainDescription) {
      payload.complainDescription = formData.complainDescription;
    }
    if (formData.incidentDate !== originalData?.incidentDate) {
      payload.incidentDate = formData.incidentDate || undefined;
    }
    if (formData.actionTaken !== originalData?.actionTaken) {
      payload.actionTaken = formData.actionTaken || "";
    }
    if (formData.status !== originalData?.status) {
      payload.status = formData.status;
    }
    // Student field is read-only and never changes, so we do not send it.

    // Teacher involvement changes
    if (involveTeacher !== originalData?.involveTeacher) {
      if (involveTeacher) {
        if (!teacher) {
          toast.error(t("Please select a teacher to involve"));
          return;
        }
        payload.teacher = teacher;
      } else {
        payload.teacher = null; // remove teacher
      }
    } else if (involveTeacher && teacher !== originalData?.teacher) {
      payload.teacher = teacher;
    }

    // Comments changes
    if (formData.teacherComment !== originalData?.teacherComment) {
      payload.teacherComment = formData.teacherComment
        ? { text: formData.teacherComment }
        : null;
    }
    if (formData.counselorComment !== originalData?.counselorComment) {
      payload.counselorComment = formData.counselorComment
        ? { text: formData.counselorComment }
        : null;
    }
    if (formData.principalComment !== originalData?.principalComment) {
      payload.principalComment = formData.principalComment
        ? { text: formData.principalComment }
        : null;
    }

    if (Object.keys(payload).length === 0) {
      toast(t("No changes detected")); // ✅ FIXED: used generic toast instead of toast.info
      return;
    }

    updateCounseling({ id, body: payload });
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : t("Not set");

  if (detailsLoading) return <Loader />;

  const counseling = detailsData?.counseling;

  // Determine selected teacher name for display
  const selectedTeacherName = teacher
    ? teacherOptions.find((opt) => opt.value === teacher)?.label ||
      getFullName(counseling?.teacher) ||
      ""
    : "";

  // Student name for read-only display
  const studentName = getFullName(counseling?.student) || formData.student;

  return (
    <AdminLayout>
      <MetaData title={t("Update Counseling")} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title={t("Update Counseling")}
          subtitle={t("Edit counseling details and add comments")}
          backUrl="/admin/counselings"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title={t("Counseling Details")}
            icon="fa-edit"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton
                  type="button"
                  label={t("Cancel")}
                  variant="secondary"
                  onClick={() => navigate("/admin/counselings")}
                />
                <AppButton
                  type="submit"
                  label={t("Update Counseling")}
                  loadingLabel={t("Updating...")}
                  isLoading={updating}
                  icon="fa-save"
                />
              </div>
            }
          >
            {/* Student – read‑only name display */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("Student")} <span className="text-red-500">*</span>
              </label>
              <AppInput value={studentName} disabled />
              <p className="text-xs text-gray-500 mt-1">
                {t("Student cannot be changed after creation")}
              </p>
            </div>

            {/* Row: Issue Type + Incident Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SearchableDropdown
                label={t("Issue Type")}
                placeholder={t("Select Issue Type")}
                value={formData.issueType}
                onChange={(value) => setFormData({ ...formData, issueType: value })}
                options={issueTypeOptions}
                isLoading={false}
                hasMore={false}
                emptyMessage={t("No issue type found")}
                loadingMessage=""
              />

              <AppInput
                label={t("Incident Date")}
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={onChange}
                helperText={t("Leave empty to keep original")}
              />
            </div>

            {/* Complain Description */}
            <div className="mb-4">
              <AppInput
                label={t("Complain / Problem")}
                name="complainDescription"
                value={formData.complainDescription}
                onChange={onChange}
                type="textarea"
                rows={3}
                required
              />
            </div>

            {/* Action Taken */}
            <div className="mb-4">
              <AppInput
                label={t("Action Taken")}
                name="actionTaken"
                value={formData.actionTaken}
                onChange={onChange}
                type="textarea"
                rows={2}
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <SearchableDropdown
                label={t("Status")}
                placeholder={t("Select Status")}
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                options={statusOptions}
                isLoading={false}
                hasMore={false}
                emptyMessage={t("No status found")}
                loadingMessage=""
              />
            </div>

            {/* Teacher Involvement Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("Teacher Involvement")}
                </span>
                <Toggle
                  checked={involveTeacher}
                  onChange={toggleTeacherInvolvement}
                  label={involveTeacher ? t("Remove Teacher") : t("Involve Teacher")}
                />
              </div>

              {involveTeacher && (
                <div className="mt-3">
                  <SearchableDropdown
                    label={t("Select Teacher")}
                    placeholder={t("Search and select teacher")}
                    value={teacher}
                    onChange={(value) => setTeacher(value)}
                    onSearch={setTeacherSearchTerm}
                    options={teacherOptions}
                    isLoading={teachersLoading}
                    hasMore={false}
                    emptyMessage={t("No teachers found")}
                    loadingMessage={t("Loading...")}
                    required
                  />
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6 mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <i className="fa fa-comment text-gray-400"></i>
                {t("Comments")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher comment only if teacher involved */}
                {involveTeacher && (
                  <AppInput
                    label={`${t("Teacher Comment")} ${
                      selectedTeacherName ? `(${selectedTeacherName})` : ""
                    }`}
                    name="teacherComment"
                    value={formData.teacherComment}
                    onChange={onChange}
                    type="textarea"
                    rows={2}
                    placeholder={t("Add teacher comment...")}
                  />
                )}
                <AppInput
                  label={t("Counselor Comment")}
                  name="counselorComment"
                  value={formData.counselorComment}
                  onChange={onChange}
                  type="textarea"
                  rows={2}
                  placeholder={t("Add counselor comment...")}
                />
                <AppInput
                  label={t("Principle Comment")}
                  name="principalComment"
                  value={formData.principalComment}
                  onChange={onChange}
                  type="textarea"
                  rows={2}
                  placeholder={t("Add principle comment...")}
                />
              </div>
            </div>

            {/* Timeline Information (read‑only) */}
            {counseling && (
              <div className="border-t border-gray-200 pt-6 mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <i className="fa fa-clock-o text-gray-400"></i>
                  {t("Timeline")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t("Created At")}:</span>{" "}
                    <span className="font-medium">
                      {formatDate(counseling.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("Reported By")}:</span>{" "}
                    <span className="font-medium">
                      {getFullName(counseling.reportedBy)} ({counseling.reporterRole})
                    </span>
                  </div>
                  {/* Show teacher name if involved */}
                  {counseling.teacher && (
                    <div>
                      <span className="text-gray-500">{t("Involved Teacher")}:</span>{" "}
                      <span className="font-medium">
                        {getFullName(counseling.teacher)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">{t("Resolved At")}:</span>{" "}
                    <span className="font-medium">
                      {formatDate(counseling.resolvedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("Closed At")}:</span>{" "}
                    <span className="font-medium">
                      {formatDate(counseling.closedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("Campus")}:</span>{" "}
                    <span className="font-medium">{counseling.campus?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("Year")}:</span>{" "}
                    <span className="font-medium">
                      {getYearDisplay(counseling.year)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateStudentCounseling;