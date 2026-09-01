import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useCreateEventMutation,
  useGetEventsQuery,
} from "../../redux/api/eventApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import { useTranslation } from "react-i18next";

const NewEvent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetEventsQuery();

  // Campus search state
  const [campusSearch, setCampusSearch] = useState("");

  const { data: campusData, isFetching: campusLoading } = useGetCampusQuery(
    { limit: 0, keyword: campusSearch, paginate: false },
    { skip: campusSearch.length < 2 } // optional: only fetch when typing 2+ chars
  );

  const campusOptions = useMemo(
    () =>
      (campusData?.campuses || campusData?.campus || []).map((c) => ({
        value: c._id,
        label: c.name,
        subtitle: c.address || "",
      })),
    [campusData]
  );

  const [event, setEvent] = useState({
    eventName: "",
    description: "",
    date: "",
    venue: "",
    isPaid: false,
    amount: "",
    currency: "USD",
    campus: "",
    campusLabel: "", // to display the selected campus name
  });

  const { eventName, description, date, venue, isPaid, amount, currency, campus, campusLabel } = event;

  const [createEvent, { isLoading, error, isSuccess }] = useCreateEventMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }
    if (isSuccess) {
      toast.success(t("Event created"));
      navigate("/admin/events");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  const onChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createEvent({
      ...event,
      campus: campus, // only send _id
    });
  };

  // Campus selection
  const selectCampus = (campusObj) => {
    setEvent((prev) => ({
      ...prev,
      campus: campusObj.value,
      campusLabel: campusObj.label,
    }));
    setCampusSearch(""); // clear search after selection
  };

  return (
    <AdminLayout>
      <MetaData title={t("Create New Event")} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={t("New Event")}
          subtitle={t("Schedule a new event")}
          backUrl="/admin/events"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title={t("Event Information")}
            icon="fa-calendar-plus"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/events" />
                <AppButton
                  type="submit"
                  label={t("Create Event")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-check"
                />
              </div>
            }
          >
            {/* ----- Searchable Campus Dropdown ----- */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">
                {t("Campus")}
              </label>

              {/* Show selected campus if any */}
              {campusLabel && !campusSearch && (
                <div className="flex items-center justify-between mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
                  <span>{campusLabel}</span>
                  <button
                    type="button"
                    onClick={() => setEvent((prev) => ({ ...prev, campus: "", campusLabel: "" }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              )}

              {/* Search input */}
              <input
                type="text"
                placeholder={t("Search for a campus...")}
                value={campusSearch}
                onChange={(e) => setCampusSearch(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Dropdown results */}
              {campusSearch.length >= 2 && campusOptions.length > 0 && (
                <ul className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto shadow-sm">
                  {campusOptions.map((c) => (
                    <li
                      key={c.value}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                      onClick={() => selectCampus(c)}
                    >
                      <span>{c.label}</span>
                      {c.subtitle && <span className="text-gray-400 text-xs">{c.subtitle}</span>}
                    </li>
                  ))}
                </ul>
              )}

              {campusLoading && (
                <div className="mt-1 text-gray-400 text-xs">
                  <i className="fa fa-spinner fa-spin mr-1"></i> {t("Loading...")}
                </div>
              )}
            </div>
            {/* ----- End Campus Dropdown ----- */}

            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label={t("Event Name")}
                name="eventName"
                value={eventName}
                onChange={onChange}
                required
              />
              <AppInput
                label={t("Venue")}
                name="venue"
                value={venue}
                onChange={onChange}
              />
            </div>

            <AppInput
              label={t("Description")}
              name="description"
              value={description}
              onChange={onChange}
              type="textarea"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <AppInput
                label={t("Date")}
                type="date"
                name="date"
                value={date}
                onChange={onChange}
                required
              />

              {/* Paid Checkbox */}
              <div className="flex items-center gap-3 pt-6">
                <label
                  htmlFor="isPaid_field"
                  className="text-[11px] font-semibold text-gray-500 uppercase cursor-pointer"
                >
                  {t("Paid Event")}
                </label>
                <input
                  type="checkbox"
                  id="isPaid_field"
                  checked={isPaid}
                  onChange={() => setEvent({ ...event, isPaid: !isPaid })}
                  className="h-5 w-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {isPaid && (
                <>
                  <AppInput
                    label={t("Amount")}
                    type="number"
                    name="amount"
                    value={amount}
                    onChange={onChange}
                    required
                  />
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase">
                      {t("Currency")}
                    </label>
                    <select
                      name="currency"
                      value={currency}
                      onChange={onChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewEvent;