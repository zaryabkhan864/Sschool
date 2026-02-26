import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetCounselingsQuery,
  useDeleteCounselingMutation,
} from "../../redux/api/counselingApi";

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

const ListStudentCounselings = () => {
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

  // Toast from navigation (e.g., after creating a counseling)
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Counseling created successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // API query
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetCounselingsQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    status: statusFilter || undefined,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const [
    deleteCounseling,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteCounselingMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedCounselingId, setSelectedCounselingId] = useState(null);

  // Global error / success handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete counseling"));
    if (deleteSuccess) {
      toast.success(t("Counseling deleted successfully"));
      setShowModal(false);
      setSelectedCounselingId(null);
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, deleteSuccess, user, t]);

  // Refetch when requested from navigation state (e.g., after edit)
  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const handleDeleteClick = (id) => {
    setSelectedCounselingId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedCounselingId) deleteCounseling(selectedCounselingId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditCounseling = (id) => {
    navigate(`/admin/counselings/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/counseling/${id}/details`);
  };

  // Status normalization for AppBadge
  const getStatusValue = (value) => {
    const validStatuses = ["pending", "under_review", "resolved", "closed"];
    if (!value) return "pending";
    const normalized = value.toLowerCase().trim();
    return validStatuses.includes(normalized) ? normalized : "pending";
  };

  // Columns using AppBadge
  const columns = [
    {
      header: t("Student Name"),
      accessor: "student.name",
      width: "30%",
      minWidth: "200px",
      render: (_, row) => {
        const name = row?.student?.name;
        return name ? (
          <TruncatedCell maxChars={25}>{name}</TruncatedCell>
        ) : (
          <span className="text-gray-400">—</span>
        );
      }
    },
    {
      header: t("Issue Type"),
      accessor: "issueType",
      width: "25%",
      minWidth: "150px",
      render: (value) => (
        <TruncatedCell maxChars={30}>{value || "—"}</TruncatedCell>
      )
    },
    {
      header: t("Incident Date"),
      accessor: "incidentDate",
      width: "20%",
      minWidth: "150px",
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
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "120px",
      render: (value) => {
        const safeStatus = getStatusValue(value);
        return <AppBadge type="counselingStatus" value={safeStatus} />;
      }
    }
  ];

  // Stats
  const counts = data?.pagination?.counts || data?.counts || { 
    total: 0, pending: 0, under_review: 0, resolved: 0, closed: 0 
  };

  const stats = [
    {
      label: t("Total Counselings"),
      value: counts.total,
      icon: "comments",
      color: "blue"
    },
    {
      label: t("Pending"),
      value: counts.pending,
      icon: "hourglass-half",
      color: "yellow"
    },
    {
      label: t("Under Review"),
      value: counts.under_review || 0,
      icon: "search",        // or "eye"
      color: "orange"
    },
    {
      label: t("Resolved"),
      value: counts.resolved,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Closed"),
      value: counts.closed || 0,
      icon: "archive",       // or "times-circle"
      color: "gray"
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "purple"
    }
  ];

  const addButton = userRole === "admin" ? (
    <AppButton to="/admin/counseling/new" label={t("Add New Counseling")} icon="plus" />
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

  // Filter dropdown using shared component
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
          <option value="under_review">{t("Under Review")}</option>
          <option value="resolved">{t("Resolved")}</option>
          <option value="closed">{t("Closed")}</option>
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
      onEdit={handleEditCounseling}
    />
  );

  const emptyState = (
    <EmptyState
      icon="comments"
      title={searchTerm ? t("No counselings found matching your search") : t("No counselings found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allCounselings")} />

      <DataTableContainer
        title={t("Counseling Management")}
        subtitle={t("Manage student counselings and track resolutions")}
        data={data?.counselings || []}
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
        searchPlaceholder={t("Search by student name or issue type...")}
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
            {t("Showing")}: {data?.counselings?.length || 0} {t("counselings")}
          </p>
        )}
        className="counseling-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this counseling?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListStudentCounselings;