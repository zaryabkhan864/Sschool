import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Redux
import { useGetClassGroupDetailsQuery } from "../../redux/api/classGroupApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

const ClassGroupDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  // --- Main class group detail query ---
  const {
    data: groupData,
    isLoading: groupLoading,
    error: groupError,
    refetch: groupRefetch,
  } = useGetClassGroupDetailsQuery(id);

  // --- State for class group info ---
  const [classGroup, setClassGroup] = useState({
    displayName: "",
    academicLevelName: "",
    gradeName: "",
    section: "",
    year: "",
    status: true,
    courses: [],
    createdAt: "",
    updatedAt: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Effect: populate state when data loads
  useEffect(() => {
    if (groupData) {
      // groupData may be the classGroup object directly (due to transformResponse)
      const g = groupData;
      setClassGroup({
        displayName: g.displayName || "",
        academicLevelName: g.academicLevel?.name || g.academicLevel?.level || "",
        gradeName: g.grade?.gradeName || "",
        section: g.section || "",
        year: g.year || "",
        status: g.status === true || g.status === "Active" ? true : false,
        courses: g.courses || [],
        createdAt: g.createdAt ? formatDate(g.createdAt) : "",
        updatedAt: g.updatedAt ? formatDate(g.updatedAt) : "",
      });
    }
    if (groupError) {
      toast.error(groupError?.data?.message || t("Error loading class group details"));
    }
  }, [groupData, groupError, t]);

  // Refresh handler
  const handleRefresh = () => {
    groupRefetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  // Loading state
  if (groupLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Class Group Details")} />

      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 border-b border-surface-100 pb-4">
          <h1 className="text-2xl-custom font-bold text-dark tracking-tight font-heading">
            {t("Class Group Details")}
          </h1>
          <p className="text-sm-custom text-dark-light/70 mt-1 font-normal">
            <i className="fa fa-info-circle mr-2 text-dark-light/60"></i>
            {t("Viewing class group information and courses")}
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-end items-center gap-3 mb-8">
          <AppButton
            to="/admin/class-groups"
            label={t("backToList")}
            icon="arrow-left"
            variant="secondary"
          />
          <AppButton
            onClick={handleRefresh}
            label={t("refresh")}
            icon="sync-alt"
            variant="secondary"
            disabled={groupLoading}
          />
          <AppButton
            to={`/admin/class-groups/edit/${id}`}
            label={t("EditClassGroup")}
            icon="edit"
            variant="primary"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Group Information Card */}
          <AppCard title={t("Basic Information")} icon="fa-users-class">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-tag mr-2 text-dark-light/60"></i>
                  {t("Display Name")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.displayName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-layer-group mr-2 text-dark-light/60"></i>
                  {t("Academic Level")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.academicLevelName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-graduation-cap mr-2 text-dark-light/60"></i>
                  {t("Grade")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.gradeName || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-hashtag mr-2 text-dark-light/60"></i>
                  {t("Section")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.section || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar-alt mr-2 text-dark-light/60"></i>
                  {t("Academic Year")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.year || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div className="pt-2">
                <AppBadge type="booleanStatus" active={classGroup.status} />
              </div>
            </div>
          </AppCard>

          {/* Courses Card – span 2 columns */}
          <AppCard
            title={t("Assigned Courses")}
            icon="fa-book"
            className="md:col-span-2"
          >
            {classGroup.courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm-custom">
                  <thead className="bg-surface-50 border-b border-surface-100">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                        {t("Course Name")}
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                        {t("Code")}
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-dark-light/70 uppercase text-xs-custom">
                        {t("Teacher")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classGroup.courses.map((course) => (
                      <tr
                        key={course._id}
                        className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-dark">
                          {course.courseName || t("N/A")}
                        </td>
                        <td className="py-2 px-3 text-dark-light/70">
                          {course.code || t("N/A")}
                        </td>
                        <td className="py-2 px-3 text-dark-light/70">
                          {course.teacher?.name || t("Not Assigned")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs-custom text-dark-light/50 mt-3">
                  {t("Total Courses")}:{" "}
                  <span className="font-semibold text-dark">
                    {classGroup.courses.length}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-dark-light/40">
                <i className="fa fa-book-open text-4xl mb-3"></i>
                <p className="text-base-custom">{t("No courses assigned yet")}</p>
              </div>
            )}
          </AppCard>

          {/* Metadata Card */}
          <AppCard title={t("Metadata")} icon="fa-clock">
            <div className="space-y-4">
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar-plus mr-2 text-dark-light/60"></i>
                  {t("Created On")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.createdAt || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs-custom font-medium text-dark-light/70 uppercase tracking-wide mb-1">
                  <i className="fa fa-calendar-check mr-2 text-dark-light/60"></i>
                  {t("Last Updated")}
                </p>
                <p className="text-lg-custom font-semibold text-dark">
                  {classGroup.updatedAt || (
                    <span className="text-dark-light/40 font-normal">
                      {t("N/A")}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </AppCard>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-surface-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm-custom text-dark-light/70">
            <div className="mb-4 sm:mb-0">
              <i className="fa fa-clock mr-2 text-dark-light/60"></i>
              {t("lastUpdated")}: {new Date().toLocaleString()}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AppButton
                to={`/admin/class-groups/${id}/students`}
                label={t("viewStudents")}
                icon="users"
                variant="secondary"
              />
              <AppButton
                to={`/admin/class-groups/${id}/schedule`}
                label={t("viewSchedule")}
                icon="calendar-alt"
                variant="secondary"
              />
              <AppButton
                to={`/admin/class-group/${id}/download`}
                label={t("Download")}
                icon="download"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassGroupDetails;