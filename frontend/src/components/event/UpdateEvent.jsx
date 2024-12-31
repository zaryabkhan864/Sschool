import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetEventDetailsQuery,
  useGetEventsQuery,
  useUpdateEventMutation,
} from "../../redux/api/eventApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const UpdateEvent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetEventsQuery();
  console.log(params);

  const [event, setEvent] = useState({
    eventName: "",
    description: "",
    date: "",
    venue: "",
    isPaid: false,
    amount: "",
    createdAt: "",
    updatedAt: "",
  });

  const {
    eventName,
    description,
    date,
    venue,
    isPaid,
    amount,
    createdAt,
    updatedAt,
  } = event;

  const [updateEvent, { isLoading, error, isSuccess }] =
    useUpdateEventMutation();
  const { data, loading } = useGetEventDetailsQuery(params?.id);

  useEffect(() => {
    if (data?.event) {
      setEvent({
        eventName: data?.event?.eventName,
        description: data?.event?.description,
        date: data?.event?.date,
        venue: data?.event?.venue,
        isPaid: data?.event?.isPaid,
        amount: data?.event?.amount,
        createdAt: data?.event?.createdAt,
        updatedAt: data?.event?.updatedAt,
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Event updated");
      navigate("/admin/events");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if ((!data && isLoading) || loading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateEvent({ id: params?.id, body: event });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Event"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Update Event</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="eventName_field"
                className="block text-sm font-medium text-gray-700"
              >
                Event Name
              </label>
              <input
                type="text"
                id="eventName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="eventName"
                value={eventName}
                onChange={onChange}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description_field"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="description"
                rows="4"
                value={description}
                onChange={onChange}
              ></textarea>
            </div>
            <div className="mb-4">
              <label
                htmlFor="date_field"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="date"
                value={date}
                onChange={onChange}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="venue_field"
                className="block text-sm font-medium text-gray-700"
              >
                Venue
              </label>
              <input
                type="text"
                id="venue_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="venue"
                value={venue}
                onChange={onChange}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Paid
              </label>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="yes"
                    name="isPaid"
                    value={true}
                    checked={isPaid === true}
                    onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="yes" className="ml-2 text-sm text-gray-700">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="no"
                    name="isPaid"
                    value={false}
                    checked={isPaid === false}
                    onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="no" className="ml-2 text-sm text-gray-700">
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="amount_field"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="amount"
                value={amount}
                onChange={onChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="createdAt_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Created At
                </label>
                <input
                  type="date"
                  id="createdAt_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="createdAt"
                  value={createdAt}
                  onChange={onChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="updatedAt_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Updated At
                </label>
                <input
                  type="date"
                  id="updatedAt_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="updatedAt"
                  value={updatedAt}
                  onChange={onChange}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "UPDATE"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdateEvent;