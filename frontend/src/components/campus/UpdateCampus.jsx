import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCampusDetailsQuery,
  useGetCampusQuery,
  useUpdateCampusMutation,
} from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const UpdateCampus = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams();
  const { refetch } = useGetCampusQuery();

  const [campus, setCampus] = useState({
    name: "",
    location: "",
    contactNumber: "",
  });

  const { name, location, contactNumber } = campus;

  const [updateCampus, { isLoading, error, isSuccess }] =
    useUpdateCampusMutation();
  const { data, loading } = useGetCampusDetailsQuery(params?.id);
  
  useEffect(() => {
    if (data?.campus) {
      setCampus({
        name: data?.campus?.name,
        location: data?.campus?.location,
        contactNumber: data?.campus?.contactNumber,
      });
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Campus updated");
      navigate("/admin/campuses");
      refetch();
    }
  }, [data, error, isSuccess, navigate, refetch]);

  if ((!data && isLoading) || loading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setCampus({ ...campus, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateCampus({ id: params?.id, body: campus });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Campus"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6"> {t('Update')} {t('Campus')}</h2>
          <form onSubmit={submitHandler}>
    
            <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label
                htmlFor="name_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Campus')} {t("Name")}
              </label>
              <input
                type="text"
                id="name_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="name"
                value={name}
                onChange={onChange}
              />
            </div>

              <div className="mb-4">
                <label
                  htmlFor="contactNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('Campus')} {t("Phone Number")}
                </label>
                <input
                  type="text"
                  id="contactNumber_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="contactNumber"
                  value={contactNumber}
                  required
                  onChange={onChange}
                />
              </div>

            </div>

            <div className="mb-4">
              <label
                htmlFor="location_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t('Campus')} {t("Address")}
              </label>
              <textarea
                id="location_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="location"
                rows="4"
                value={location}
                onChange={onChange}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : t('Update')}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UpdateCampus;
