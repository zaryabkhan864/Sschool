import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCampusDetailsQuery,
  useGetCampusQuery,
  useUpdateCampusMutation,
} from "../../redux/api/campusApi";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";

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
  const { data, isLoading: detailsLoading } = useGetCampusDetailsQuery(params?.id);

  // For update confirmation modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (data?.campus) {
      setCampus({
        name: data?.campus?.name || "",
        location: data?.campus?.location || "",
        contactNumber: data?.campus?.contactNumber || "",
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

  if (detailsLoading) {
    return <Loader />;
  }

  const onChange = (e) => {
    setCampus({ ...campus, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => {
    setCampus({ ...campus, contactNumber: value });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateCampus({ id: params?.id, body: campus });
  };

  return (
    <AdminLayout>
      <MetaData title={"Update Campus"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {t("Update")} {t("Campus")}
          </h2>
          <form onSubmit={handleSubmitClick}>
            <div className="grid grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="mb-4">
                <label
                  htmlFor="name_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Campus")} {t("Name")}
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

              {/* Phone Number Field */}
              <div className="mb-4">
                <label
                  htmlFor="contactNumber_field"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Campus")} {t("Phone Number")}
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"tr"}
                    value={contactNumber}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: "contactNumber",
                      required: true,
                    }}
                    containerClass="w-full"
                    inputClass="!w-full !h-[42px] !pl-14 !pr-3 !py-2 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                    buttonClass="!border-none !bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className="mb-4">
              <label
                htmlFor="location_field"
                className="block text-sm font-medium text-gray-700"
              >
                {t("Campus")} {t("Address")}
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

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : t("Update")}
            </button>
          </form>
        </div>
      </div>

      {/* Update Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={isLoading}
        message={t("Do you want to update this campus?")}
      />
    </AdminLayout>
  );
};

export default UpdateCampus;