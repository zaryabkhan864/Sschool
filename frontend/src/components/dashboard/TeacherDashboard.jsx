import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Slider from "../layout/Slider";
// import Slider from "../layout/Slider";

const TeacherDashboard = () => {
  const { data } = useGetGradesQuery();
  return (
    <AdminLayout>
      <MetaData title="Teacher Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {data?.grades?.map((grade) => (
            <div
              key={grade._id}
              className="bg-green-500 text-white p-3 rounded-lg shadow-md"
            >
              <h4 className="text font-bold">{grade.gradeName}</h4>
              <p className="text-lg mt-2">
                {grade.yearFrom} to {grade.yearTo}
              </p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Activities
          </h2>
          <div className="bg-white shadow-md rounded-md p-4">
            <ul className="divide-y divide-gray-200">
              <li className="py-2">
                Student John Doe submitted the assignment "Math Homework".
              </li>
              <li className="py-2">
                Teacher Jane Smith uploaded new study material for "Physics".
              </li>
              <li className="py-2">
                New event "Annual Sports Day" scheduled for next month.
              </li>
              <li className="py-2">
                Parent meeting scheduled for class 10th on Friday.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Slider />
    </AdminLayout>
  );
};

export default TeacherDashboard;