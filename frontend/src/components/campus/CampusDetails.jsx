import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetCampusDetailsQuery } from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

const CampusDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, error, refetch } = useGetCampusDetailsQuery(params?.id);

  // State only model fields
  const [campus, setCampus] = useState({
    name: "",
    code: "",
    location: "",
    contactNumber: "",
    email: "",
    isActive: true,
    createdAt: "",
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

  useEffect(() => {
    if (data?.campus) {
      setCampus({
        name: data.campus.name || "",
        code: data.campus.code || "",
        location: data.campus.location || "",
        contactNumber: data.campus.contactNumber || "",
        email: data.campus.email || "",
        isActive: data.campus.isActive ?? true,
        createdAt: data.campus.createdAt ? formatDate(data.campus.createdAt) : "",
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed") || "Refreshed");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={t("Campus Details") || "Campus Details"} />

      <div className="p-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-display-sm font-bold text-dark tracking-tight font-heading">
              {t("Campus")} {t("Details")}
            </h1>
            <p className="text-sm-custom text-dark-light mt-1 font-normal">
              <i className="fa fa-info-circle mr-2 text-brand-500"></i>
              {t("Viewing Campus Information") || "Viewing campus details and information"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AppButton
              onClick={handleRefresh}
              label={t("refresh") || "Refresh"}
              icon="sync-alt"
            />
            <AppButton
              to="/admin/campuses"
              label={t("backToList") || "Back to List"}
              icon="arrow-left"
            />
            <AppButton
              to={`/admin/campuses/${params?.id}`}
              label={t("EditCampus") || "Edit Campus"}
              icon="edit"
              variant="primary"
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-premium border border-surface-100 overflow-hidden">
          {/* Campus Header – subtle brand gradient */}
          <div className="bg-gradient-to-r from-brand-50 to-brand-100 p-6 border-b border-surface-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-soft overflow-hidden bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <i className="fa fa-university text-white text-5xl"></i>
                </div>
                <div className="absolute bottom-2 right-2">
                  <AppBadge
                    variant={campus.isActive ? "success" : "danger"}
                  >
                    {campus.isActive ? "Active" : "Inactive"}
                  </AppBadge>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-display-sm font-bold text-dark mb-2 tracking-tight font-heading">
                  {campus.name}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm-custom bg-brand-50 text-brand-700 border border-brand-100 font-medium">
                    <i className="fa fa-map-marker-alt mr-2 text-xs"></i>
                    {campus.location || t("N/A")}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm-custom bg-surface-50 text-dark-light border border-surface-100 font-medium">
                    <i className="fa fa-phone mr-2 text-xs"></i>
                    {campus.contactNumber || t("N/A")}
                  </span>
                  {campus.code && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm-custom bg-brand-50 text-brand-700 border border-brand-100 font-medium">
                      <i className="fa fa-qrcode mr-2 text-xs"></i>
                      {campus.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid – Only model fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Information Card */}
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                <h3 className="text-xl-custom font-semibold text-dark mb-4 flex items-center tracking-tight font-heading">
                  <i className="fa fa-building mr-3 text-brand-500 text-lg"></i>
                  {t("Campus Information") || "Campus Information"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-university mr-2 text-gray-400"></i>
                      {t("Campus Name") || "Campus Name"}
                    </p>
                    <p className="text-base-custom font-semibold text-dark">
                      {campus.name || <span className="text-gray-400 font-normal">{t("N/A")}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-qrcode mr-2 text-gray-400"></i>
                      {t("Campus Code") || "Code"}
                    </p>
                    <p className="text-base-custom font-semibold text-dark">
                      {campus.code || <span className="text-gray-400 font-normal">{t("N/A")}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-map-marker-alt mr-2 text-gray-400"></i>
                      {t("Address") || "Address"}
                    </p>
                    <p className="text-base-custom font-semibold text-dark">
                      {campus.location || <span className="text-gray-400 font-normal">{t("N/A")}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-phone mr-2 text-gray-400"></i>
                      {t("Phone Number") || "Phone Number"}
                    </p>
                    <p className="text-base-custom font-semibold text-dark">
                      {campus.contactNumber || <span className="text-gray-400 font-normal">{t("N/A")}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-envelope mr-2 text-gray-400"></i>
                      {t("Email") || "Email"}
                    </p>
                    <p className="text-base-custom font-semibold text-dark">
                      {campus.email || <span className="text-gray-400 font-normal">{t("N/A")}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Timestamp Card */}
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-100">
                <h3 className="text-xl-custom font-semibold text-dark mb-4 flex items-center tracking-tight font-heading">
                  <i className="fa fa-info-circle mr-3 text-brand-500 text-lg"></i>
                  {t("Status & Info") || "Status & Info"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-user-shield mr-2 text-gray-400"></i>
                      {t("Campus Status") || "Campus Status"}
                    </p>
                    <AppBadge variant={campus.isActive ? "success" : "danger"}>
                      {campus.isActive ? "Active" : "Inactive"}
                    </AppBadge>
                  </div>
                  <div>
                    <p className="text-xs-custom font-medium text-dark-light mb-1 uppercase tracking-wide">
                      <i className="fa fa-calendar-plus mr-2 text-gray-400"></i>
                      {t("Created On") || "Created On"}
                    </p>
                    <p className="text-base-custom font-semibold text-dark">
                      {campus.createdAt || <span className="text-gray-400 font-normal">{t("N/A")}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CampusDetails;