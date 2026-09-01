// components/homework/HomeworkDetailsTeacher.jsx
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetHomeworkAssignmentDetailsQuery } from "../../redux/api/homeworkApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

const HomeworkDetailsTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useGetHomeworkAssignmentDetailsQuery(id);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading posting"));
  }, [error, t]);

  if (isLoading) return <Loader />;

  const homework = data?.homework;
  if (!homework) return null;

  return (
    <AdminLayout>
      <MetaData title={homework.title} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-dark tracking-tight font-heading">{homework.title}</h1>
          <p className="text-sm-custom text-dark-light/70 mt-1">
            <i className="fa fa-info-circle mr-2 text-dark-light/60"></i>
            {t("Posting details")}
          </p>
        </div>

        <div className="flex justify-end items-center gap-3 mb-8">
          <AppButton to="/teacher/homework" label={t("backToList")} icon="arrow-left" variant="secondary" />
          <AppButton
            to={`/teacher/homework/${id}/submissions`}
            label={t("View Submissions")}
            icon="inbox"
            variant="secondary"
          />
          <AppButton to={`/teacher/homework/${id}/edit`} label={t("Edit")} icon="edit" variant="primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AppCard title={t("Posting Information")} icon="fa-file-alt">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Type")}
                </p>
                <p className="text-lg-custom font-semibold text-dark capitalize">{t(homework.type)}</p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Class Group")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">{homework.classGroup?.displayName || t("N/A")}</p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Course")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {homework.course ? `${homework.course.courseName} (${homework.course.code})` : t("N/A")}
                </p>
              </div>
              <div className="pt-2">
                <AppBadge type="booleanStatus" active={homework.status} />
              </div>
            </div>
          </AppCard>

          <AppCard title={t("Description")} icon="fa-align-left" className="md:col-span-2">
            <div className="bg-surface-50 p-4 rounded-lg border border-surface-100 min-h-[120px]">
              <p className="text-base-custom text-dark leading-relaxed whitespace-pre-wrap">
                {homework.description}
              </p>
            </div>
          </AppCard>

          <AppCard title={t("Schedule & Marks")} icon="fa-calendar">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Due Date")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {new Date(homework.dueDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Total Marks")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">{homework.totalMarks ?? t("N/A")}</p>
              </div>
            </div>
          </AppCard>

          <AppCard title={t("Target")} icon="fa-users">
            {homework.targetType === "all" ? (
              <p className="text-sm text-gray-600">{t("All students in this class group")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(homework.targetStudents || []).map((s) => (
                  <span key={s._id} className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    {[s.firstName, s.lastName].filter(Boolean).join(" ")}
                  </span>
                ))}
              </div>
            )}
          </AppCard>

          {homework.attachments?.length > 0 && (
            <AppCard title={t("Attachments")} icon="fa-paperclip">
              <div className="flex flex-wrap gap-2">
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
            </AppCard>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomeworkDetailsTeacher;
