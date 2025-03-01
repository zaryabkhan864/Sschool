import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

import {
  useCreateCampusMutation,
  useGetCampusQuery,
} from "../../redux/api/campusApi";
import { useTranslation } from "react-i18next";

const NewCampus = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refetch } = useGetCampusQuery();

  const [campus, setCampus] = useState({
    name: "",
    location: "",
    contactNumber: "",
  });

  const { name, location, contactNumber} = campus;

  const [createCampus, { isLoading, error, isSuccess }] =
    useCreateCampusMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Campus created");
      navigate("/admin/campuses");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setCampus({ ...campus, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createCampus(campus);
  };

  return (
    <AdminLayout>
      <MetaData title={"Create New Campus"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{t('New')} {t('Campus')}</h2>
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
                required
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
                  // maxLength={8}
                  // minLength={8}
                  // pattern="\d{8}"
                  required
                  // onInvalid={(e) =>
                  //   e.target.setCustomValidity("Code must be exactly 8 digits")
                  // }
                  // onInput={(e) => {
                  //   e.target.setCustomValidity("");
                  // }}
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
              className={`w-full py-2 text-white font-semibold rounded-md ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
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

export default NewCampus;
