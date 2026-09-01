// component
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";




// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";
import { useGetClassGroupStudentsQuery } from "../../redux/api/classGroupApi";

const ClassGroupStudents = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // --- Students of this class group ---
  const {
    data: studentsData,
    isLoading,
    isFetching,
    error: studentsError,
    refetch,
  } = useGetClassGroupStudentsQuery(id, { skip: !id });

  const [keyword, setKeyword] = useState("");

  const classGroup = studentsData?.classGroup || null;
  const students = studentsData?.students || [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (studentsError) {
      toast.error(
        studentsError?.data?.message || t("Error loading students")
      );
    }
  }, [studentsError, t]);

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  const filteredStudents = useMemo(() => {
    if (!keyword.trim()) return students;
    const q = keyword.trim().toLowerCase();
    return students.filter((s) => {
      const fullName = `${s.firstName || ""} ${s.middleName || ""} ${
        s.lastName || ""
      }`.toLowerCase();
      return (
        fullName.includes(q) ||
        (s.userId || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
      );
    });
  }, [students, keyword]);

  const activeCount = students.filter(
    (s) => s.accountStatus === "active"
  ).length;
  const inactiveCount = students.length - activeCount;

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Class Group Students")} />

      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-dark tracking-tight font-heading">
            {t("Class Group Students")}
          </h1>
          <p className="text-sm-custom text-dark-light/70 mt-1 font-normal">
            <i className="fa fa-info-circle mr-2 text-dark-light/60"></i>
            {classGroup?.displayName
              ? t("Students enrolled in") + ` ${classGroup.displayName}`
              : t("Viewing students enrolled in this class group")}
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-end items-center gap-3 mb-8">
          <AppButton
            to={`/admin/class-groups/${id}`}
            label={t("backToDetails") || t("backToList")}
            icon="arrow-left"
            variant="secondary"
          />
          <AppButton
            onClick={handleRefresh}
            label={t("refresh")}
            icon="sync-alt"
            variant="secondary"
            disabled={isFetching}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <AppCard title={t("Total Students")} icon="fa-users">
            <p className="text-2xl-custom font-bold text-dark">
              {students.length}
            </p>
          </AppCard>
          <AppCard title={t("Active")} icon="fa-user-check">
            <p className="text-2xl-custom font-bold text-green-600">
              {activeCount}
            </p>
          </AppCard>
          <AppCard title={t("Inactive")} icon="fa-user-slash">
            <p className="text-2xl-custom font-bold text-red-500">
              {inactiveCount}
            </p>
          </AppCard>
        </div>

        {/* Students Table Card */}
        <AppCard title={t("Enrolled Students")} icon="fa-user-graduate">
          {/* Search */}
          <div className="mb-4 flex items-center gap-2 max-w-sm">
            <div className="relative w-full">
              <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-dark-light/40 text-sm-custom"></i>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("Search by name, ID or email") || "Search..."}
                className="w-full pl-9 pr-3 py-2 text-sm-custom border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm-custom">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Student Name")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Student ID")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Email")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Gender")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Enrolled Since")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Status")}
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                    >
                      <td className="py-2 px-3 text-dark font-medium">
                        {[student.firstName, student.middleName, student.lastName]
                          .filter(Boolean)
                          .join(" ") || t("N/A")}
                      </td>
                      <td className="py-2 px-3 text-dark-light/70">
                        {student.userId || t("N/A")}
                      </td>
                      <td className="py-2 px-3 text-dark-light/70">
                        {student.email || t("N/A")}
                      </td>
                      <td className="py-2 px-3 text-dark-light/70 capitalize">
                        {student.gender || t("N/A")}
                      </td>
                      <td className="py-2 px-3 text-dark-light/70">
                        {student.startDate
                          ? formatDate(student.startDate)
                          : t("N/A")}
                      </td>
                      <td className="py-2 px-3">
                        <AppBadge
                          type="booleanStatus"
                          active={student.accountStatus === "active"}
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <AppButton
                          onClick={() =>
                            navigate(`/admin/students/${student._id}`)
                          }
                          label={t("view")}
                          icon="eye"
                          variant="secondary"
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs-custom text-dark-light/50 mt-3">
                {t("Total Students")}:{" "}
                <span className="font-semibold text-dark">
                  {filteredStudents.length}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-dark-light/40">
              <i className="fa fa-user-graduate text-4xl mb-3"></i>
              <p className="text-base-custom">
                {keyword
                  ? t("No students match your search")
                  : t("No students enrolled yet")}
              </p>
            </div>
          )}
        </AppCard>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-surface-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm-custom text-dark-light/70">
            <div className="mb-4 sm:mb-0">
              <i className="fa fa-clock mr-2 text-dark-light/60"></i>
              {t("lastUpdated")}: {new Date().toLocaleString()}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                to={`/admin/class-groups/${id}`}
                label={t("backToDetails") || t("backToList")}
                icon="arrow-left"
                variant="secondary"
              />
              <AppButton
                to={`/admin/class-groups/${id}/schedule`}
                label={t("viewSchedule")}
                icon="calendar-alt"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassGroupStudents;
