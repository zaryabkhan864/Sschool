import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";

import {
  useGetTeacherLeaveDetailsQuery,
  useUpdateTeacherLeaveMutation,
} from "../../redux/api/teacherLeaveApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

// Helper to get full name from user object (same as in other components)
const getFullName = (user) => {
  if (!user) return "";
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ");
};

const UpdateTeacherLeave = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();

  // API hooks
  const { data, isLoading: leaveLoading, error: leaveError } =
    useGetTeacherLeaveDetailsQuery(params.id);

  const [
    updateTeacherLeave,
    { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess },
  ] = useUpdateTeacherLeaveMutation();

  // local state
  const [teacherLeave, setTeacherLeave] = useState({
    teacher: "",
    teacherName: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
    status: "Pending",
  });

  const { teacherName, leaveType, startDate, endDate, totalDays, reason, status } =
    teacherLeave;

  const [showModal, setShowModal] = useState(false);

  // Status options for dropdown
  const statusOptions = [
    { value: "Pending", label: t("Pending") },
    { value: "Approved", label: t("Approved") },
    { value: "Rejected", label: t("Rejected") },
  ];

  const [statusSearchTerm, setStatusSearchTerm] = useState("");

  const filteredStatusOptions = useMemo(() => {
    if (!statusSearchTerm.trim()) return statusOptions;
    return statusOptions.filter((opt) =>
      opt.label.toLowerCase().includes(statusSearchTerm.toLowerCase())
    );
  }, [statusOptions, statusSearchTerm]);

  // fetch leave data
  useEffect(() => {
    if (data) {
      const leave = data.teacherLeave;
      const teacherObj = leave.teacher;
      setTeacherLeave({
        teacher: teacherObj?._id || "",
        teacherName: getFullName(teacherObj) || teacherObj?.name || "",
        leaveType: leave.leaveType || "",
        startDate: leave.startDate?.split("T")[0] || "",
        endDate: leave.endDate?.split("T")[0] || "",
        totalDays: leave.totalDays || "",
        reason: leave.reason || "",
        status: leave.status || "Pending",
      });
    }

    if (leaveError) {
      toast.error(leaveError?.data?.message || t("Error loading leave details"));
    }

    if (updateError) {
      toast.error(updateError?.data?.message || t("Error updating leave"));
    }

    if (updateSuccess) {
      toast.success(t("Teacher leave updated successfully"));
      navigate("/admin/teacher-leaves");
    }
  }, [data, leaveError, updateError, updateSuccess, navigate, t]);

  if (leaveLoading) {
    return <Loader />;
  }

  // only status change is allowed
  const handleStatusChange = (value) => {
    setTeacherLeave((prevState) => ({
      ...prevState,
      status: value,
    }));
  };

  // submit confirm modal
  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateTeacherLeave({ id: params.id, body: { status: teacherLeave.status } });
  };

  return (
    <AdminLayout>
      <MetaData title={t("Update Teacher Leave")} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title={t("Update Teacher Leave")}
          subtitle={t("Review and update leave status")}
          backUrl="/admin/teacher-leaves"
        />

        <form onSubmit={handleSubmitClick}>
          <AppCard
            title={t("Leave Details")}
            icon="fa-calendar-check"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/teacher-leaves" />
                <AppButton
                  type="submit"
                  label={t("Update Leave")}
                  loadingLabel={t("Updating...")}
                  isLoading={updateLoading}
                  icon="fa-save"
                />
              </div>
            }
          >
            {/* Teacher (Read Only) */}
            <div className="mb-4">
              <AppInput
                label={t("Teacher")}
                type="text"
                value={teacherName}
                readOnly
              />
            </div>

            {/* Leave Type (Read Only) */}
            <div className="mb-4">
              <AppInput
                label={t("Leave Type")}
                type="text"
                value={leaveType}
                readOnly
              />
            </div>

            {/* Dates (Read Only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <AppInput
                label={t("Start Date")}
                type="text"
                value={startDate}
                readOnly
              />
              <AppInput
                label={t("End Date")}
                type="text"
                value={endDate}
                readOnly
              />
              <AppInput
                label={t("Total Days")}
                type="text"
                value={totalDays}
                readOnly
              />
            </div>

            {/* Reason (Read Only) */}
            <div className="mb-4">
              <AppInput
                label={t("Reason")}
                type="textarea"
                rows={4}
                value={reason}
                readOnly
              />
            </div>

            {/* Status (Editable) */}
            <div className="mb-4">
              <SearchableDropdown
                label={t("Status")}
                placeholder={t("Select status")}
                value={status}
                onChange={handleStatusChange}
                onSearch={setStatusSearchTerm}
                options={filteredStatusOptions}
                isLoading={false}
                hasMore={false}
                emptyMessage={t("No status found")}
                loadingMessage=""
                required
              />
            </div>
          </AppCard>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={updateLoading}
        message={t("Do you want to update the status of this Teacher Leave?")}
      />
    </AdminLayout>
  );
};

export default UpdateTeacherLeave;