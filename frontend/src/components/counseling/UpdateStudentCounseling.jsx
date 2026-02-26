import React, { useEffect, useState, useMemo, useCallback } from "react";
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

  // ------------------ Students list (for SearchableDropdown) ------------------
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentsList, setStudentsList] = useState([]);
  const [hasMoreStudents, setHasMoreStudents] = useState(true);

  const {
    data: studentsData,
    isFetching: studentsLoading,
  } = useGetUserByTypeQuery({
    type: "student",
    page: studentPage,
    limit: 10,
    keyword: studentSearchTerm,
  });

  useEffect(() => {
    if (studentsData?.users) {
      const newStudents = studentsData.users;
      setStudentsList((prev) =>
        studentPage === 1 ? newStudents : [...prev, ...newStudents]
      );
      setHasMoreStudents(newStudents.length === 10);
    }
  }, [studentsData, studentPage]);

  const handleStudentSearch = useCallback((searchValue, page) => {
    setStudentSearchTerm(searchValue);
    setStudentPage(page);
    if (page === 1) setStudentsList([]);
  }, []);

  const studentOptions = useMemo(
    () =>
      studentsList.map((s) => ({
        value: s._id,
        label: `${s.name} – ${
          s.grade?.[0]?.gradeDetails?.gradeName || t("No Grade Assigned")
        }`,
      })),
    [studentsList, t]
  );

  // ------------------ Issue type options ------------------
  const issueTypeOptions = [
    { value: "fighting", label: t("Fighting") },
    { value: "misbehavior", label: t("Misbehavior") },
    { value: "academic", label: t("Academic") },
    { value: "attendance", label: t("Attendance") },
    { value: "bullying", label: t("Bullying") },
    { value: "personal_issue", label: t("Personal Issue") },
    { value: "other", label: t("Other") },
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
        // Comments are free text fields – initially empty (they will be sent on update)
        teacherComment: "",
        counselorComment: "",
        principalComment: "",
      };
      setFormData(initial);
      setOriginalData(initial);
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
      navigate(`/admin/counselings/${id}`);
    }
  }, [detailsError, updateError, isSuccess, navigate, t, id]);

  // ------------------ Form change handler ------------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------ Submit handler (only changed fields) ------------------
  const submitHandler = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.issueType) {
      toast.error(t("Please select an issue type"));
      return;
    }
    if (!formData.complainDescription?.trim()) {
      toast.error(t("Please describe the complaint"));
      return;
    }

    // Build payload with only changed fields
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
    // Student field is disabled, but if you ever allow changing it:
    if (formData.student !== originalData?.student) {
      payload.student = formData.student;
    }

    // Comments: send only if changed (empty string means clear comment)
    if (formData.teacherComment !== originalData?.teacherComment) {
      payload.teacherComment = formData.teacherComment || null;
    }
    if (formData.counselorComment !== originalData?.counselorComment) {
      payload.counselorComment = formData.counselorComment || null;
    }
    if (formData.principalComment !== originalData?.principalComment) {
      payload.principalComment = formData.principalComment || null;
    }

    if (Object.keys(payload).length === 0) {
      toast.info(t("No changes detected"));
      return;
    }

    updateCounseling({ id, body: payload });
  };

  // Helper to format dates for timeline
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : t("Not set");

  if (detailsLoading) return <Loader />;

  const counseling = detailsData?.counseling;

  return (
    <AdminLayout>
      <MetaData title={t("Update Counseling")} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title={t("Update Counseling")}
          subtitle={t("Edit counseling details and add comments")}
          backUrl={`/admin/counselings/${id}`}
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
                  onClick={() => navigate(`/admin/counselings/${id}`)}
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
            {/* Student - disabled SearchableDropdown (read‑only) */}
            <div className="mb-4">
              <SearchableDropdown
                label={t("Student")}
                placeholder={t("Search student...")}
                value={formData.student}
                onChange={(selectedValue) =>
                  setFormData({ ...formData, student: selectedValue })
                }
                onSearch={handleStudentSearch}
                options={studentOptions}
                isLoading={studentsLoading}
                hasMore={hasMoreStudents}
                required
                disabled // if your component supports it; otherwise use a plain input
                emptyMessage={t("No results found")}
                loadingMessage={t("Loading...")}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("Student cannot be changed after creation")}
              </p>
            </div>

            {/* Row: Issue Type + Incident Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Issue Type dropdown */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase block mb-1.5">
                  {t("Issue Type")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="" disabled>
                    {t("Select Issue Type")}
                  </option>
                  {issueTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Incident Date */}
              <AppInput
                label={t("Incident Date")}
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={onChange}
                helperText={t("Leave empty to keep original")}
              />
            </div>

            {/* Complain Description - full width */}
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

            {/* Action Taken - full width */}
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

            {/* Status - full width dropdown */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase block mb-1.5">
                {t("Status")} <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6 mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <i className="fa fa-comment text-gray-400"></i>
                {t("Comments")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AppInput
                  label={t("Teacher Comment")}
                  name="teacherComment"
                  value={formData.teacherComment}
                  onChange={onChange}
                  type="textarea"
                  rows={2}
                  placeholder={t("Add teacher comment...")}
                />
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
                  label={t("Principal Comment")}
                  name="principalComment"
                  value={formData.principalComment}
                  onChange={onChange}
                  type="textarea"
                  rows={2}
                  placeholder={t("Add principal comment...")}
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
                      {counseling.reportedBy?.name} ({counseling.reporterRole})
                    </span>
                  </div>
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
                    <span className="font-medium">{counseling.year}</span>
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