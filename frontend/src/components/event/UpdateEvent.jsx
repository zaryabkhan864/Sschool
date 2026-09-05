import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetEventDetailsQuery,
  useGetEventsQuery,
  useUpdateEventMutation,
} from "../../redux/api/eventApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SelectField from "../GUI/SelectField";

const EVENT_CURRENCIES = ["USD", "CAD", "AUD", "EUR", "GBP", "TRY"];

const UpdateEvent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetEventsQuery();

  const [campusSearch, setCampusSearch] = useState("");
  const { data: campusData, isFetching: campusLoading } = useGetCampusQuery(
    { limit: 0, keyword: campusSearch, paginate: false },
    { skip: campusSearch.length < 2 }
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
    campusLabel: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const { eventName, description, date, venue, isPaid, amount, currency, campus, campusLabel } = event;

  const [updateEvent, { isLoading, error, isSuccess }] = useUpdateEventMutation();
  const { data, isLoading: detailsLoading } = useGetEventDetailsQuery(params?.id, { skip: !params?.id });

  useEffect(() => {
    if (data?.event) {
      const e = data.event;
      setEvent({
        eventName: e.eventName || "",
        description: e.description || "",
        // 👇 FIX: was `date?.event?.date` (referencing the wrong,
        // not-yet-defined variable) — always came out empty/undefined.
        date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
        venue: e.venue || "",
        isPaid: !!e.isPaid,
        amount: e.amount != null ? e.amount : "",
        currency: e.currency || "USD",
        campus: e.campus?._id || e.campus || "",
        campusLabel: e.campus?.name || "",
        image: "",
      });
      if (e.image?.url) setImagePreview(e.image.url);
    }
  }, [data]);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error updating event"));
    if (isSuccess) {
      toast.success(t("Event updated"));
      navigate("/admin/events");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  if (detailsLoading) return <Loader />;

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview(reader.result);
          setEvent((prev) => ({ ...prev, image: reader.result }));
          setRemoveImage(false);
        }
      };
      reader.readAsDataURL(file);
      return;
    }
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setEvent((prev) => ({ ...prev, image: "" }));
    setRemoveImage(true);
  };

  const selectCampus = (campusObj) => {
    setEvent((prev) => ({ ...prev, campus: campusObj.value, campusLabel: campusObj.label }));
    setCampusSearch("");
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!eventName.trim() || !description.trim() || !date || !venue.trim()) {
      return toast.error(t("Please fill all required fields"));
    }
    if (isPaid && (!amount || Number(amount) <= 0)) {
      return toast.error(t("Please enter a valid amount for a paid event"));
    }

    const body = {
      eventName,
      description,
      date,
      venue,
      isPaid,
      campus: campus || undefined,
      ...(isPaid ? { amount: Number(amount), currency } : {}),
      ...(event.image ? { image: event.image } : {}),
      ...(removeImage ? { image: null } : {}),
    };

    updateEvent({ id: params?.id, body });
  };

  return (
    <AdminLayout>
      <MetaData title={t("Update Event")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Edit Event")}
          subtitle={t("Update this event's details")}
          backUrl="/admin/events"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title={t("Event Information")}
            icon="fa-calendar-alt"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/events" />
                <AppButton
                  type="submit"
                  label={t("Save Changes")}
                  loadingLabel={t("Saving...")}
                  isLoading={isLoading}
                  icon="fa-check"
                />
              </div>
            }
          >
            {/* ----- Event Image ----- */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">
                {t("Event Image")} <span className="text-gray-400 normal-case">({t("optional")})</span>
              </label>
              <div className="mt-1 flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300">
                    <i className="fa fa-image"></i>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={onChange}
                  className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {imagePreview && (
                  <button type="button" onClick={handleRemoveImage} className="text-xs text-red-500 hover:text-red-700">
                    {t("Remove")}
                  </button>
                )}
              </div>
            </div>

            {/* ----- Searchable Campus Dropdown ----- */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">{t("Campus")}</label>

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

              <input
                type="text"
                placeholder={t("Search for a campus...")}
                value={campusSearch}
                onChange={(e) => setCampusSearch(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput label={t("Event Name")} name="eventName" value={eventName} onChange={onChange} required />
              <AppInput label={t("Venue")} name="venue" value={venue} onChange={onChange} required />
            </div>

            <div className="mt-4">
              <AppInput
                label={t("Description")}
                name="description"
                value={description}
                onChange={onChange}
                type="textarea"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <AppInput label={t("Date")} type="date" name="date" value={date} onChange={onChange} required />

              <div className="flex items-center gap-3 pt-6">
                <label htmlFor="isPaid_field" className="text-[11px] font-semibold text-gray-500 uppercase cursor-pointer">
                  {t("Paid Event")}
                </label>
                {/* 👇 FIX: was missing `checked={isPaid}` entirely — this
                    checkbox never reflected the loaded event's actual
                    isPaid value, it just always rendered unchecked. */}
                <input
                  type="checkbox"
                  id="isPaid_field"
                  checked={isPaid}
                  onChange={() => setEvent((prev) => ({ ...prev, isPaid: !prev.isPaid }))}
                  className="h-5 w-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {isPaid && (
                <>
                  <AppInput
                    label={t("Amount")}
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={amount}
                    onChange={onChange}
                    required
                  />
                  <SelectField
                    label={t("Currency")}
                    value={currency}
                    onChange={(val) => setEvent((prev) => ({ ...prev, currency: val }))}
                    options={EVENT_CURRENCIES}
                  />
                </>
              )}
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateEvent;
