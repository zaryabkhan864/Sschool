// components/homework/ListHomeworkStudent.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useGetStudentHomeworkQuery } from "../../redux/api/homeworkApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import EmptyState from "../GUI/EmptyState";
import AppButton from "../GUI/AppButton";

const typeBadge = (type, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  return type === "assignment" ? (
    <span className={`${base} bg-purple-100 text-purple-800`}>{t("Assignment")}</span>
  ) : (
    <span className={`${base} bg-blue-100 text-blue-800`}>{t("Homework")}</span>
  );
};

const submissionBadge = (homework, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  if (!homework.mySubmission) {
    const overdue = new Date(homework.dueDate) < new Date();
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
    <span className={map[homework.mySubmission.status] || `${base} bg-gray-100 text-gray-800`}>
      {t(homework.mySubmission.status)}
    </span>
  );
};

const ListHomeworkStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading, error, refetch, isFetching } = useGetStudentHomeworkQuery(
    { type: typeFilter || undefined },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading your homework"));
  }, [error, t]);

  const homeworks = data?.homeworks || [];

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("My Homework & Assignments")} />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t("My Homework & Assignments")}</h1>
            <p className="text-xs text-gray-500">{t("Everything assigned to your class")}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">{t("All Types")}</option>
              <option value="homework">{t("Homework")}</option>
              <option value="assignment">{t("Assignment")}</option>
            </select>
            <AppButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} variant="secondary" />
          </div>
        </div>

        {homeworks.length === 0 ? (
          <EmptyState icon="tasks" title={t("Nothing assigned yet")} message={t("New homework and assignments will show up here.")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworks.map((hw) => (
              <div
                key={hw._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/student/homework/${hw._id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-dark text-base pr-2">{hw.title}</h3>
                  {submissionBadge(hw, t)}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {typeBadge(hw.type, t)}
                  <span className="text-xs text-gray-400">{hw.course?.courseName}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{hw.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>
                    <i className="fa fa-clock mr-1"></i>
                    {t("Due")}: {new Date(hw.dueDate).toLocaleString()}
                  </span>
                  {hw.totalMarks != null && <span>{hw.totalMarks} {t("marks")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ListHomeworkStudent;
