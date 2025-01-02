import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetEventDetailsQuery } from "../../redux/api/eventApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const EventDetails = () => {
  const params = useParams();
  const { data, loading, error } = useGetEventDetailsQuery(params?.id);
  const [event, setEvent] = useState({
    eventName: "",
    description: "",
    date: "",
    venue: "",
    isPaid: false,
    amount: "",
    currency: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (data?.event) {
      setEvent({
        eventName: data?.event?.eventName,
        description: data?.event?.description,
        date: data?.event?.date,
        venue: data?.event?.venue,
        isPaid: data?.event?.isPaid,
        amount: data?.event?.amount,
        currency: data?.event?.currency,
        createdAt: data?.event?.createdAt,
        updatedAt: data?.event?.updatedAt,
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }
  }, [data, error]);

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={"Grade Details"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Event Details</h2>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Event Name:</p>
            <p className="text-lg text-gray-900">{event.eventName}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Description:</p>
            <p className="text-lg text-gray-900">{event.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Date:</p>
              <p className="text-lg text-gray-900">{event.date}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Venue</p>
              <p className="text-lg text-gray-900">{event.venue}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Paid</p>
              <p className="text-lg text-gray-900">{event.isPaid}</p>
            </div>
            {event.isPaid && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Amount</p>
                <p className="text-lg text-gray-900">{event.amount}</p>
              </div>
            )}
            {event.isPaid && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Currency</p>
                <p className="text-lg text-gray-900">{event.currency}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Created At</p>
              <p className="text-lg text-gray-900">{event.createdAt}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Updated At</p>
              <p className="text-lg text-gray-900">{event.updatedAt}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventDetails;
