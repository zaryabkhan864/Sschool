import React, { useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import MetaData from "../layout/MetaData";
import Header from "../layout/Header";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(new Date().setDate(1));
  const [endDate, setEndDate] = useState(new Date());

  const submitHandler = () => {
    toast.success("Data fetched successfully!");
  };

  return (
    <AdminLayout>
      <MetaData title="Admin Dashboard" />
    

      <div className="flex flex-col md:flex-row items-center justify-between bg-gray-100 p-4 shadow rounded-md">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 w-full"
            />
          </div>
        </div>

        <button
          onClick={submitHandler}
          className="mt-4 md:mt-0 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300"
        >
          Fetch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">Total Students</h2>
          <p className="text-lg mt-2">1234</p>
        </div>

        <div className="bg-red-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">Total Teachers</h2>
          <p className="text-lg mt-2">56</p>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">Pending Assignments</h2>
          <p className="text-lg mt-2">234</p>
        </div>

        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <p className="text-lg mt-2">5</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
        <div className="bg-white shadow-md rounded-md p-4">
          <ul className="divide-y divide-gray-200">
            <li className="py-2">Student John Doe submitted the assignment "Math Homework".</li>
            <li className="py-2">Teacher Jane Smith uploaded new study material for "Physics".</li>
            <li className="py-2">New event "Annual Sports Day" scheduled for next month.</li>
            <li className="py-2">Parent meeting scheduled for class 10th on Friday.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
