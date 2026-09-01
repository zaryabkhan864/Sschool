// components/project/ProjectSubmissionsList.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetSubmissionsForProjectQuery,
  useGradeProjectSubmissionMutation,
  useDeleteProjectSubmissionMutation,
} from "../../redux/api/projectApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import Loader from "../layout/Loader";
import EmptyState from "../GUI/EmptyState";
import ConfirmationModal from "../GUI/ConfirmationModal";

const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const statusBadge = (status, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const map = {
    submitted: `${base} bg-green-100 text-green-800`,
    late: `${base} bg-red-100 text-red-800`,
    graded: `${base} bg-blue-100 text-blue-800`,
  };
  return <span className={map[status] || `${base} bg-gray-100 text-gray-800`}>{t(status)}</span>;
};

const GradeRow = ({ submission, project, onDelete }) => {
  const { t } = useTranslation();
  const [marks, setMarks] = useState(submission.marksObtained ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [expanded, setExpanded] = useState(false);

  const [gradeSubmission, { isLoading: isGrading, isSuccess, error }] = useGradeProjectSubmissionMutation();

  useEffect(() => {
    if (isSuccess) toast.success(t("Grade saved"));
    if (error) toast.error(error?.data?.message || t("Failed to save grade"));
  }, [isSuccess, error, t]);

  const saveGrade = () => {
    gradeSubmission({ id: submission._id, marksObtained: marks === "" ? null : Number(marks), feedback });
  };

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <div>
          <p className="text-sm font-semibold text-dark">{getFullName(submission.student)}</p>
          <p className="text-xs text-gray-400">
            {submission.student?.userId} · {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(submission.status, t)}
          {submission.marksObtained != null && (
            <span className="text-xs font-medium text-gray-600">
              {submission.marksObtained}
              {project?.totalMarks ? ` / ${project.totalMarks}` : ""}
            </span>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            {expanded ? t("Hide") : t("View / Grade")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(submission._id)}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-4 bg-gray-50/60 border-t border-gray-100 space-y-3">
          {submission.submissionType === "text" ? (
            <p className="text-sm text-dark whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-100">
              {submission.textContent}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(submission.attachments || []).map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-brand-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-brand-50"
                >
                  <i className="fa fa-paperclip mr-1"></i>
                  {file.name || t("Attachment")}
                </a>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("Marks")}</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
                min={0}
                max={project?.totalMarks || undefined}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t("Feedback")}</label>
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder={t("Optional feedback for the student")}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <AppButton
              onClick={saveGrade}
              label={t("Save Grade")}
              icon="fa-check"
              isLoading={isGrading}
              loadingLabel={t("Saving...")}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectSubmissionsList = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data, isLoading, error, refetch } = useGetSubmissionsForProjectQuery(id);
  const [deleteSubmission, { isSuccess: deleteSuccess, error: deleteError }] = useDeleteProjectSubmissionMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading submissions"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete submission"));
    if (deleteSuccess) {
      toast.success(t("Submission deleted"));
      setShowModal(false);
      refetch();
    }
  }, [error, deleteError, deleteSuccess, t, refetch]);

  const handleDeleteClick = (submissionId) => {
    setSelectedId(submissionId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedId) deleteSubmission(selectedId);
  };

  if (isLoading) return <Loader />;

  const project = data?.project;
  const submissions = data?.submissions || [];
  const notSubmitted = data?.notSubmitted || [];
  const counts = data?.counts || { targeted: 0, submitted: 0, pending: 0 };

  return (
    <AdminLayout>
      <MetaData title={t("Submissions")} />

      <div className="max-w-5xl mx-auto">
        <AppPageHeader title={project?.title || t("Submissions")} subtitle={t("Project")} backUrl="/teacher/projects" />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <AppCard>
            <p className="text-xs text-gray-500 uppercase">{t("Targeted")}</p>
            <p className="text-2xl-custom font-bold text-dark">{counts.targeted}</p>
          </AppCard>
          <AppCard>
            <p className="text-xs text-gray-500 uppercase">{t("Submitted")}</p>
            <p className="text-2xl-custom font-bold text-green-600">{counts.submitted}</p>
          </AppCard>
          <AppCard>
            <p className="text-xs text-gray-500 uppercase">{t("Pending")}</p>
            <p className="text-2xl-custom font-bold text-red-500">{counts.pending}</p>
          </AppCard>
        </div>

        <AppCard title={t("Submitted")} icon="fa-inbox" className="mb-6">
          {submissions.length === 0 ? (
            <EmptyState icon="inbox" title={t("No submissions yet")} message={t("Students haven't submitted anything yet.")} />
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <GradeRow key={s._id} submission={s} project={project} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
        </AppCard>

        <AppCard title={t("Not Submitted Yet")} icon="fa-clock">
          {notSubmitted.length === 0 ? (
            <p className="text-sm text-gray-400">{t("Everyone has submitted.")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {notSubmitted.map((student) => (
                <span key={student._id} className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                  {getFullName(student)}
                </span>
              ))}
            </div>
          )}
        </AppCard>
      </div>

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        message={t("Are you sure you want to delete this submission?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ProjectSubmissionsList;
