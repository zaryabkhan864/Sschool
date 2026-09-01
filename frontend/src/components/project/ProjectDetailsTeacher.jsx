// components/project/ProjectDetailsTeacher.jsx
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetProjectDetailsQuery } from "../../redux/api/projectApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

const ProjectDetailsTeacher = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data, isLoading, error } = useGetProjectDetailsQuery(id);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading project"));
  }, [error, t]);

  if (isLoading) return <Loader />;

  const project = data?.project;
  if (!project) return null;

  return (
    <AdminLayout>
      <MetaData title={project.title} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-dark tracking-tight font-heading">{project.title}</h1>
          <p className="text-sm-custom text-dark-light/70 mt-1">
            <i className="fa fa-info-circle mr-2 text-dark-light/60"></i>
            {t("Project details")}
          </p>
        </div>

        <div className="flex justify-end items-center gap-3 mb-8">
          <AppButton to="/teacher/projects" label={t("backToList")} icon="arrow-left" variant="secondary" />
          <AppButton
            to={`/teacher/projects/${id}/submissions`}
            label={t("View Submissions")}
            icon="inbox"
            variant="secondary"
          />
          <AppButton to={`/teacher/projects/${id}/edit`} label={t("Edit")} icon="edit" variant="primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AppCard title={t("Project Information")} icon="fa-file-alt">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Class Group")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">{project.classGroup?.displayName || t("N/A")}</p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Course")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {project.course ? `${project.course.courseName} (${project.course.code})` : t("Interdisciplinary")}
                </p>
              </div>
              <div className="pt-2">
                <AppBadge type="booleanStatus" active={project.status} />
              </div>
            </div>
          </AppCard>

          <AppCard title={t("Description")} icon="fa-align-left" className="md:col-span-2">
            <div className="bg-surface-50 p-4 rounded-lg border border-surface-100 min-h-[120px]">
              <p className="text-base-custom text-dark leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
          </AppCard>

          <AppCard title={t("Schedule & Marks")} icon="fa-calendar">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Due Date")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">{new Date(project.dueDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  {t("Total Marks")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">{project.totalMarks ?? t("N/A")}</p>
              </div>
            </div>
          </AppCard>

          <AppCard title={t("Target")} icon="fa-users">
            {project.targetType === "all" ? (
              <p className="text-sm text-gray-600">{t("All students in this class group")}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(project.targetStudents || []).map((s) => (
                  <span key={s._id} className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    {[s.firstName, s.lastName].filter(Boolean).join(" ")}
                  </span>
                ))}
              </div>
            )}
          </AppCard>

          {project.attachments?.length > 0 && (
            <AppCard title={t("Attachments")} icon="fa-paperclip">
              <div className="flex flex-wrap gap-2">
                {project.attachments.map((file, idx) => (
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

export default ProjectDetailsTeacher;
