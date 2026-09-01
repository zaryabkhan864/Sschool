// components/homework/HomeworkDetailsStudent.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetStudentHomeworkQuery, useSubmitHomeworkMutation } from "../../redux/api/homeworkApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import Loader from "../layout/Loader";
import FileUpload from "../UploadFile";

const statusBadge = (status, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const map = {
    submitted: `${base} bg-green-100 text-green-800`,
    late: `${base} bg-orange-100 text-orange-800`,
    graded: `${base} bg-blue-100 text-blue-800`,
  };
  return <span className={map[status] || `${base} bg-gray-100 text-gray-800`}>{t(status)}</span>;
};

const HomeworkDetailsStudent = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  // Reuses the same cached list the student's dashboard fetches — it
  // already carries each posting's `mySubmission`, so no extra endpoint
  // is needed just to check submission status here.
  const { data, isLoading, error } = useGetStudentHomeworkQuery({});
  const homework = useMemo(() => (data?.homeworks || []).find((h) => h._id === id), [data, id]);

  const [submissionType, setSubmissionType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [submitHomework, { isLoading: isSubmitting, error: submitError, isSuccess }] = useSubmitHomeworkMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading homework"));
  }, [error, t]);

  useEffect(() => {
    if (submitError) toast.error(submitError?.data?.message || t("Failed to submit"));
    if (isSuccess) {
      toast.success(t("Submitted successfully"));
      setShowForm(false);
    }
  }, [submitError, isSuccess, t]);

  if (isLoading) return <Loader />;
  if (!homework) return null;

  const mySubmission = homework.mySubmission;

  const submitHandler = (e) => {
    e.preventDefault();
    if (submissionType === "text" && !textContent.trim()) {
      return toast.error(t("Please write your answer"));
    }
    if (submissionType === "file" && files.length === 0) {
      return toast.error(t("Please attach a file"));
    }

    submitHomework({
      homeworkAssignment: homework._id,
      submissionType,
      textContent: submissionType === "text" ? textContent : undefined,
      attachments: submissionType === "file" ? files : [],
    });
  };

  return (
    <AdminLayout>
      <MetaData title={homework.title} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader title={homework.title} subtitle={t("Homework Details")} backUrl="/student/homework" />

        <AppCard title={t("Details")} icon="fa-file-alt" className="mb-6">
          <div className="space-y-3">
            <p className="text-sm text-dark whitespace-pre-wrap">{homework.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t border-gray-50">
              <span>
                <i className="fa fa-book mr-1"></i>
                {homework.course?.courseName}
              </span>
              <span>
                <i className="fa fa-clock mr-1"></i>
                {t("Due")}: {new Date(homework.dueDate).toLocaleString()}
              </span>
              {homework.totalMarks != null && (
                <span>
                  <i className="fa fa-star mr-1"></i>
                  {homework.totalMarks} {t("marks")}
                </span>
              )}
            </div>
            {homework.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {homework.attachments.map((file, idx) => (
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
          </div>
        </AppCard>

        <AppCard title={t("Your Submission")} icon="fa-upload">
          {mySubmission && !showForm ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {statusBadge(mySubmission.status, t)}
                <span className="text-xs text-gray-400">
                  {t("Submitted")}: {new Date(mySubmission.submittedAt).toLocaleString()}
                </span>
              </div>

              {mySubmission.submissionType === "text" ? (
                <p className="text-sm text-dark whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {mySubmission.textContent}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(mySubmission.attachments || []).map((file, idx) => (
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

              {mySubmission.status === "graded" && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-800">
                    {t("Marks")}: {mySubmission.marksObtained}
                    {homework.totalMarks ? ` / ${homework.totalMarks}` : ""}
                  </p>
                  {mySubmission.feedback && (
                    <p className="text-sm text-blue-700 mt-1">{mySubmission.feedback}</p>
                  )}
                </div>
              )}

              <AppButton onClick={() => setShowForm(true)} label={t("Resubmit")} icon="fa-redo" variant="secondary" />
            </div>
          ) : (
            <form onSubmit={submitHandler} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm-custom text-dark cursor-pointer">
                  <input
                    type="radio"
                    checked={submissionType === "text"}
                    onChange={() => setSubmissionType("text")}
                  />
                  {t("Write Answer")}
                </label>
                <label className="flex items-center gap-2 text-sm-custom text-dark cursor-pointer">
                  <input
                    type="radio"
                    checked={submissionType === "file"}
                    onChange={() => setSubmissionType("file")}
                  />
                  {t("Upload File")}
                </label>
              </div>

              {submissionType === "text" ? (
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={6}
                  placeholder={t("Write your answer here...")}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              ) : (
                <FileUpload setIsUploadingFile={setIsUploadingFile} setFiles={setFiles} loading={isSubmitting} />
              )}

              <div className="flex justify-end gap-3">
                {mySubmission && (
                  <AppButton type="button" onClick={() => setShowForm(false)} label={t("Cancel")} variant="secondary" />
                )}
                <AppButton
                  type="submit"
                  label={mySubmission ? t("Resubmit") : t("Submit")}
                  loadingLabel={t("Submitting...")}
                  isLoading={isSubmitting}
                  icon="fa-paper-plane"
                />
              </div>
            </form>
          )}
        </AppCard>
      </div>
    </AdminLayout>
  );
};

export default HomeworkDetailsStudent;
