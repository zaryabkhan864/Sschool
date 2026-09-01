// components/project/ListProjectsStudent.jsx
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useGetStudentProjectsQuery } from "../../redux/api/projectApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import EmptyState from "../GUI/EmptyState";
import AppButton from "../GUI/AppButton";

const submissionBadge = (project, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  if (!project.mySubmission) {
    const overdue = new Date(project.dueDate) < new Date();
    return overdue ? (
      <span className={`${base} bg-red-100 text-red-800`}>{t("Overdue")}</span>
    ) : (
      <span className={`${base} bg-yellow-100 text-yellow-800`}>{t("Pending")}</span>
    );
  }
  const map = {
    submitted: `${base} bg-green-100 text-green-800`,
    late: `${base} bg-orange-100 text-orange-800`,
    graded: `${base} bg-blue-100 text-blue-800`,
  };
  return (
    <span className={map[project.mySubmission.status] || `${base} bg-gray-100 text-gray-800`}>
      {t(project.mySubmission.status)}
    </span>
  );
};

const ListProjectsStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useGetStudentProjectsQuery({});

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading your projects"));
  }, [error, t]);

  const projects = data?.projects || [];

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("My Projects")} />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t("My Projects")}</h1>
            <p className="text-xs text-gray-500">{t("Projects assigned to your class")}</p>
          </div>
          <AppButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} variant="secondary" />
        </div>

        {projects.length === 0 ? (
          <EmptyState icon="project-diagram" title={t("No projects assigned yet")} message={t("New projects will show up here.")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/student/projects/${p._id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-dark text-base pr-2">{p.title}</h3>
                  {submissionBadge(p, t)}
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {p.course?.courseName || t("Interdisciplinary")}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>
                    <i className="fa fa-clock mr-1"></i>
                    {t("Due")}: {new Date(p.dueDate).toLocaleString()}
                  </span>
                  {p.totalMarks != null && <span>{p.totalMarks} {t("marks")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ListProjectsStudent;
