import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useGetCampusDetailsQuery } from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const CampusDetails = () => {
  const { t } = useTranslation();

  const params = useParams();
  const { data, loading, error } = useGetCampusDetailsQuery(params?.id);

  const [campus, setCampus] = useState({
    name: "",
    location: "",
    contactNumber: "",
  });

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
  }, [data, error]);

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <MetaData title={"Campus Details"} />
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6"> {t('Campus')} {t('Details')}</h2>
          
          <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">{t('Campus')} {t("Name")}:</p>
            <p className="text-lg text-gray-900">{campus.name}</p>
          </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">{t('Campus')} {t("Phone Number")}:</p>
              <p className="text-lg text-gray-900">{campus.contactNumber}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">{t('Campus')} {t("Address")}:</p>
            <p className="text-lg text-gray-900">{campus.location}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CampusDetails;
