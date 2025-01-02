import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetGradeDetailsQuery,
  useGetGradesQuery,
  useUpdateGradeMutation,
} from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const UpdateGrade = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetGradesQuery();

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    yearFrom: "",
    yearTo: "",
  });

  const { gradeName, description, yearFrom, yearTo } = grade;

  const [updateGrade, { isLoading, error, isSuccess }] =
    useUpdateGradeMutation();
  const { data, loading } = useGetGradeDetailsQuery(params?.id);

  useEffect(() => {
    if (data?.grade) {
      setGrade({
        gradeName: data?.grade?.gradeName,
        description: data?.grade?.description,
        yearFrom: data?.grade?.yearFrom,
        yearTo: data?.grade?.yearTo,
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Grade updated");
      navigate("/admin/grades");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if ((!data && isLoading) || loading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setGrade({ ...grade, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateGrade({ id: params?.id, body: grade });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Grade"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Update Grade</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label
                htmlFor="gradeName_field"
                className="block text-sm font-medium text-gray-700"
              >
                Grade Name
              </label>
              <input
                type="text"
                id="gradeName_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="gradeName"
                value={gradeName}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="description_field"
                rows="4"
                name="description"
                value={description}
                onChange={onChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="yearFrom_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year From
                </label>
                <input
                  type="number"
                  id="yearFrom_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="yearFrom"
                  value={yearFrom}
                  onChange={onChange}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="yearTo_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year To
                </label>
                <input
                  type="number"
                  id="yearTo_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="yearTo"
                  value={yearTo}
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

export default UpdateGrade;
