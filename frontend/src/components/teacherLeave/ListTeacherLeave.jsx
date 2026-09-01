import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetTeacherLeavesQuery,
  useDeleteTeacherLeaveMutation,
} from "../../redux/api/teacherLeaveApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import ActionButtons from "../GUI/ActionButtons";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import AppBadge from "../GUI/AppBadge";

const ListTeacherLeave = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Teacher leave created successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetTeacherLeavesQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    status: statusFilter || undefined,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [
    deleteTeacherLeave,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteTeacherLeaveMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete leave"));
    if (deleteSuccess) {
      toast.success(t("Teacher leave deleted successfully"));
      setShowModal(false);
      setSelectedLeaveId(null);
    }
    if (user?.role === "admin" || user?.role === "principle") {
      setUserRole(user.role);
    }
  }, [error, deleteError, deleteSuccess, user, t]);

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const handleDeleteClick = (id) => {
    setSelectedLeaveId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedLeaveId) deleteTeacherLeave(selectedLeaveId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditLeave = (id) => {
    navigate(`/admin/teacher-leave/${id}/edit`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/teacher-leave/${id}/details`);
  };

  const getStatusValue = (value) => {
    const validStatuses = ["pending", "approved", "rejected"];
    if (!value) return "pending";
    const normalized = value.toLowerCase().trim();
    return validStatuses.includes(normalized) ? normalized : "pending";
  };

  const columns = [
    {
      header: t("Teacher"),
      accessor: "teacher.firstName",
      width: "25%",
      minWidth: "180px",
      render: (_, row) => {
        const teacher = row?.teacher;
        if (!teacher) return <span className="text-gray-400">—</span>;
        const fullName = [teacher.firstName, teacher.middleName, teacher.lastName]
          .filter(Boolean)
          .join(" ");
        return fullName ? (
          <TruncatedCell maxChars={25}>{fullName}</TruncatedCell>
        ) : (
          <span className="text-gray-400">—</span>
        );
      }
    },
    {
      header: t("Leave Type"),
      accessor: "leaveType",
      width: "15%",
      minWidth: "120px",
      render: (value) => (
        <TruncatedCell maxChars={20}>{value || "—"}</TruncatedCell>
      )
    },
    {
      header: t("Start Date"),
      accessor: "startDate",
      width: "15%",
      minWidth: "130px",
      render: (value) => {
        if (!value) return <span className="text-gray-400">—</span>;
        const formattedDate = new Date(value).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return <span>{formattedDate}</span>;
      }
    },
    {
      header: t("End Date"),
      accessor: "endDate",
      width: "15%",
      minWidth: "130px",
      render: (value) => {
        if (!value) return <span className="text-gray-400">—</span>;
        const formattedDate = new Date(value).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return <span>{formattedDate}</span>;
      }
    },
    {
      header: t("Total Days"),
      accessor: "totalDays",
      width: "10%",
      minWidth: "80px",
      render: (value) => value || "—"
    },
    {
      header: t("Reason"),
      accessor: "reason",
      width: "20%",
      minWidth: "150px",
      render: (value) => (
        <TruncatedCell maxChars={30}>{value || "—"}</TruncatedCell>
      )
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "10%",
      minWidth: "100px",
      render: (value) => {
        const safeStatus = getStatusValue(value);
        return <AppBadge type="leaveStatus" value={safeStatus} />;
      }
    }
  ];

  const counts = data?.pagination?.counts || data?.counts || {
    total: 0, pending: 0, approved: 0, rejected: 0
  };

  const stats = [
    {
      label: t("Total Leaves"),
      value: counts.total,
      icon: "calendar-alt",
      color: "blue"
    },
    {
      label: t("Pending"),
      value: counts.pending,
      icon: "hourglass-half",
      color: "yellow"
    },
    {
      label: t("Approved"),
      value: counts.approved || 0,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Rejected"),
      value: counts.rejected || 0,
      icon: "times-circle",
      color: "red"
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "purple"
    }
  ];

  const addButton = (userRole === "admin" || userRole === "principle") ? (
    <AppButton to="/admin/teacher-leave/new" label={t("Add New Leave")} icon="plus" />
  ) : null;

  const refreshButton = (
    <AppButton
      onClick={handleRefresh}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  const filters = (
    <FilterDropdown
      limit={limit}
      onLimitChange={(newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
      }}
      onReset={() => {
        setSearch("");
        setSearchTerm("");
        setStatusFilter("");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Status")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("All Status")}</option>
          <option value="pending">{t("Pending")}</option>
          <option value="approved">{t("Approved")}</option>
          <option value="rejected">{t("Rejected")}</option>
        </select>
      </div>
    </FilterDropdown>
  );

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      onView={handleViewDetails}
      onEdit={handleEditLeave}
    />
  );

  const emptyState = (
    <EmptyState
      icon="calendar-times"
      title={searchTerm ? t("No teacher leaves found matching your search") : t("No teacher leaves found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allTeacherLeaves")} />

      <DataTableContainer
        title={t("Teacher Leave Management")}
        subtitle={t("Manage teacher leave requests and approvals")}
        data={data?.teacherLeaves || []}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search by teacher name, leave type, or reason...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {data?.teacherLeaves?.length || 0} {t("leaves")}
          </p>
        )}
        className="teacher-leave-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this teacher leave?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListTeacherLeave;