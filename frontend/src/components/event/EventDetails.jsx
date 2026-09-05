import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetEventDetailsQuery } from "../../redux/api/eventApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "-";

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() : "";

const EventDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { data, isLoading, error } = useGetEventDetailsQuery(params?.id, { skip: !params?.id });

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading event"));
  }, [error, t]);

  if (isLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  const event = data?.event;
  if (!event) return null;

  return (
    <AdminLayout>
      <MetaData title={t("Event Details")} />

      <div className="max-w-4xl mx-auto space-y-6">
        <AppPageHeader
          title={event.eventName}
          subtitle={t("Event Details")}
          backUrl="/admin/events"
        />

        <AppCard
          title={t("Overview")}
          icon="fa-calendar-alt"
          footer={
            <div className="flex justify-end">
              <AppButton
                label={t("Edit Event")}
                icon="fa-pencil-alt"
                onClick={() => navigate(`/admin/events/${event._id}`)}
              />
            </div>
          }
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {event.image?.url ? (
              <img
                src={event.image.url}
                alt={event.eventName}
                className="w-full sm:w-48 h-32 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-full sm:w-48 h-32 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300 flex-shrink-0">
                <i className="fa fa-image text-2xl"></i>
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Description")}</p>
                <p className="text-sm-custom text-gray-800 mt-1">{event.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Date")}</p>
                  <p className="text-sm-custom text-gray-800 mt-1">{formatDate(event.date)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Venue")}</p>
                  <p className="text-sm-custom text-gray-800 mt-1">{event.venue}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Campus")}</p>
                  <p className="text-sm-custom text-gray-800 mt-1">{event.campus?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Organizer")}</p>
                  <p className="text-sm-custom text-gray-800 mt-1">{getFullName(event.organizer) || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard title={t("Pricing")} icon="fa-dollar-sign">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Type")}</p>
              <div className="mt-1">
                <AppBadge type="booleanStatus" active={event.isPaid} />
              </div>
            </div>
            {event.isPaid && (
              <>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Amount")}</p>
                  <p className="text-sm-custom text-gray-800 mt-1">{Number(event.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Currency")}</p>
                  <p className="text-sm-custom text-gray-800 mt-1">{event.currency}</p>
                </div>
              </>
            )}
          </div>
        </AppCard>

        <AppCard title={t("Record Info")} icon="fa-info-circle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Created At")}</p>
              <p className="text-sm-custom text-gray-800 mt-1">{formatDate(event.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">{t("Last Updated")}</p>
              <p className="text-sm-custom text-gray-800 mt-1">{formatDate(event.updatedAt)}</p>
            </div>
          </div>
        </AppCard>
      </div>
    </AdminLayout>
  );
};

export default EventDetails;
