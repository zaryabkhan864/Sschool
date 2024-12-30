import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import {
  useCreateEventMutation,
  useGetEventsQuery,
} from "../../redux/api/eventApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const NewEvent = () => {
  const navigate = useNavigate();
  const { refetch } = useGetEventsQuery();

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

  const [createEvent, { isLoading, error, isSuccess }] =
    useCreateEventMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Event created");
      navigate("/admin/events");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createEvent(event);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Grade"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">New Event</h2>
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
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "CREATE"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewEvent;
