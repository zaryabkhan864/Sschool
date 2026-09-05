import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

// Redux
import {
  useCreateTeacherLeaveMutation,
  useGetTeacherLeavesQuery,
} from "../../redux/api/teacherLeaveApi";
import { useGetUserByTypeQuery } from "../../redux/api/authApi";

// Shared GUI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import SearchableDropdown from "../layout/SearchableDropdown";

const getFullName = (user) => {
  if (!user) return "";
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ");
};

const NewTeacherLeave = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  // 👇 FIX: previously EVERY role saw a searchable "pick any teacher"
  // dropdown, meaning a teacher applying for their own leave could just as
  // easily file it under someone else's name. A teacher now has their own
  // name locked in automatically; only admin/principle can pick who the
  // leave is for.
  const isSelfService = currentUser?.role === "teacher";

  const { refetch } = useGetTeacherLeavesQuery();

  // ------------------ Form state ------------------
  const [teacherLeave, setTeacherLeave] = useState({
    teacher: isSelfService ? currentUser._id : "",
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
  });

  const { teacher, leaveType, startDate, endDate, totalDays, reason } =
    teacherLeave;

  // ------------------ Teacher dropdown state (admin/principle only) ------------------
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  const {
    data: teachersData,
    isFetching: teachersLoading,
  } = useGetUserByTypeQuery(
    {
      type: "teacher",
      status: "active",
      limit: 0,
      keyword: teacherSearchTerm,
    },
    { skip: isSelfService } // no need to fetch the whole teacher list for self-service
  );

  const teacherOptions = useMemo(() => {
    if (!teachersData?.users) return [];
    return teachersData.users.map((user) => ({
      value: user._id,
      label: getFullName(user) || user.email,
    }));
  }, [teachersData]);

  // ------------------ Leave type options ------------------
  const leaveTypeOptions = [
    { value: "Full Day", label: t("Full Day") },
    { value: "Half Day", label: t("Half Day") },
  ];

  const [leaveTypeSearchTerm, setLeaveTypeSearchTerm] = useState("");

  const filteredLeaveTypeOptions = useMemo(() => {
    if (!leaveTypeSearchTerm.trim()) return leaveTypeOptions;
    return leaveTypeOptions.filter((opt) =>
      opt.label.toLowerCase().includes(leaveTypeSearchTerm.toLowerCase())
    );
  }, [leaveTypeOptions, leaveTypeSearchTerm]);

  // ------------------ Create teacher leave mutation ------------------
  const [createTeacherLeave, { isLoading, error, isSuccess }] =
    useCreateTeacherLeaveMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || t("Error creating leave"));
    }
    if (isSuccess) {
      toast.success(t("Teacher leave created successfully"));
      navigate("/admin/teacher-leaves");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch, t]);

  // ------------------ Handlers ------------------
  const calculateTotalDays = (start, end) => {
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const diffTime = endDateObj - startDateObj;
      const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;
      return diffDays > 0 ? diffDays : "";
    }
    return "";
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setTeacherLeave((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        updated.totalDays = calculateTotalDays(
          updated.startDate,
          updated.endDate
        );
      }
      return updated;
    });
  };

  const handleTeacherChange = (value) => {
    setTeacherLeave((prev) => ({ ...prev, teacher: value }));
  };

  const handleLeaveTypeChange = (value) => {
    setTeacherLeave((prev) => ({ ...prev, leaveType: value }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!teacher) {
      toast.error(t("Please select a teacher"));
      return;
    }
    if (!leaveType) {
      toast.error(t("Please select a leave type"));
      return;
    }
    if (!startDate) {
      toast.error(t("Please select a start date"));
      return;
    }
    if (!endDate) {
      toast.error(t("Please select an end date"));
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error(t("End date cannot be before start date"));
      return;
    }
    if (!reason || reason.trim() === "") {
      toast.error(t("Please provide a reason"));
      return;
    }

    createTeacherLeave(teacherLeave);
  };

  return (
    <AdminLayout>
      <MetaData title={t("New Teacher Leave")} />

      <div className=" mx-auto">
        <AppPageHeader
          title={t("New Teacher Leave")}
          subtitle={
            isSelfService
              ? t("Apply for your own leave")
              : t("Create a leave record for a teacher")
          }
          backUrl="/admin/teacher-leaves"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title={t("Leave Details")}
            icon="fa-calendar-alt"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/admin/teacher-leaves" />
                <AppButton
                  type="submit"
                  label={t("Create Leave")}
                  loadingLabel={t("Creating...")}
                  isLoading={isLoading}
                  icon="fa-save"
                />
              </div>
            }
          >
            {/* Teacher */}
            <div className="mb-4">
              {isSelfService ? (
                <AppInput
                  label={t("Applying As")}
                  type="text"
                  value={getFullName(currentUser) || currentUser?.email || ""}
                  readOnly
                  helperText={t("You can only apply for your own leave")}
                />
              ) : (
                <SearchableDropdown
                  label={t("Teacher")}
                  placeholder={t("Search and select teacher")}
                  value={teacher}
                  onChange={handleTeacherChange}
                  onSearch={setTeacherSearchTerm}
                  options={teacherOptions}
                  isLoading={teachersLoading}
                  hasMore={false}
                  emptyMessage={t("No teachers found")}
                  loadingMessage={t("Loading...")}
                  showSelected={false}
                  required
                />
              )}
            </div>

            {/* Leave Type */}
            <div className="mb-4">
              <SearchableDropdown
                label={t("Leave Type")}
                placeholder={t("Select leave type")}
                value={leaveType}
                onChange={handleLeaveTypeChange}
                onSearch={setLeaveTypeSearchTerm}
                options={filteredLeaveTypeOptions}
                isLoading={false}
                hasMore={false}
                emptyMessage={t("No leave type found")}
                loadingMessage=""
                showSelected={false}
                required
              />
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <AppInput
                label={t("Start Date")}
                type="date"
                name="startDate"
                value={startDate}
                onChange={onChange}
                required
              />
              <AppInput
                label={t("End Date")}
                type="date"
                name="endDate"
                value={endDate}
                onChange={onChange}
                required
              />
            </div>

            {/* Total Days (read-only) */}
            <div className="mb-4">
              <AppInput
                label={t("Total Days")}
                type="text"
                name="totalDays"
                value={totalDays}
                readOnly
                helperText={t("Calculated automatically")}
              />
            </div>

            {/* Reason */}
            <div className="mb-4">
              <AppInput
                label={t("Reason")}
                name="reason"
                value={reason}
                onChange={onChange}
                type="textarea"
                rows={4}
                required
              />
            </div>
          </AppCard>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewTeacherLeave;