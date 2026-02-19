import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  useDeleteGradeMutation,
  useGetGradesQuery,
} from "../../redux/api/gradesApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AddButton from "../layout/AddButton";
import RefreshButton from "../layout/RefreshButton";
import StatusBadge from "../GUI/StatusBadge";
import ActionButtons from "../GUI/ActionButtons";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";

const ListGrades = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Toast from navigation (e.g., after creating a grade)
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Grade created successfully!"));
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
  } = useGetGradesQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
  }, {
    refetchOnMountOrArgChange: true,   // ensures fresh data after mutations
  });

  const [
    deleteGrade,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess },
  ] = useDeleteGradeMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState(null);

  // Global error / success handling
  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete grade"));
    if (deleteSuccess) {
      toast.success(t("Grade deleted successfully"));
      setShowModal(false);
      setSelectedGradeId(null);
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
    setSelectedGradeId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGradeId) deleteGrade(selectedGradeId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const handleEditGrade = (id) => {
    navigate(`/admin/grades/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/grade/${id}/details`);
  };

  // Columns using shared components
  const columns = [
    {
      header: t("Grade Name"),
      accessor: "gradeName",
      width: "25%",
      minWidth: "180px",
      render: (value) => <TruncatedCell lines={1}>{value}</TruncatedCell>
    },
    {
      header: t("Description"),
      accessor: "description",
      width: "35%",
      minWidth: "250px",
      render: (value) => value ? (
        <TruncatedCell lines={1} className="max-w-[300px]">{value}</TruncatedCell>
      ) : (
        <span className="text-sm text-gray-400 italic">{t("No description")}</span>
      )
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "20%",
      minWidth: "150px",
      render: (value) => (
        <TruncatedCell lines={1}>{value?.name || 'N/A'}</TruncatedCell>
      )
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "15%",
      minWidth: "100px",
      render: (value) => <StatusBadge active={value} />
    }
  ];

  // Stats
  const stats = [
    {
      label: t("Total Grades"),
      value: data?.pagination?.total || 0,
      icon: "graduation-cap",
      color: "blue"
    },
    {
      label: t("Active Grades"),
      value: data?.grades?.filter(grade => grade.status).length || 0,
      icon: "check-circle",
      color: "green"
    },
    {
      label: t("Items Shown"),
      value: data?.grades?.length || 0,
      icon: "list-ul",
      color: "purple"
    },
    {
      label: t("Total Pages"),
      value: data?.pagination?.totalPages || 1,
      icon: "file-alt",
      color: "orange"
    }
  ];

  const addButton = userRole === "admin" ? (
    <AddButton to="/admin/grade/new" text={t("Add New Grade")} icon="plus" />
  ) : null;

  const refreshButton = (
    <RefreshButton
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
        setCurrentPage(1);
        setLimit(8);
      }}
    />
  );

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={userRole}
      onDelete={handleDeleteClick}
      isDeleteLoading={isDeleteLoading}
      editHref={`/admin/grades/${row._id}`}
      onView={handleViewDetails}
      onEdit={handleEditGrade}
    />
  );

  const emptyState = (
    <EmptyState
      icon="graduation-cap"
      title={searchTerm ? t("No grades found matching your search") : t("No grades found")}
      message={t("Try adjusting your search or filters to find what you're looking for.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allGrades")} />

      <DataTableContainer
        title={t("Grade Management")}
        subtitle={t("Manage grade levels and their details")}
        data={data?.grades || []}
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
        searchPlaceholder={t("Search grades by name or description...")}
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
            {t("Showing")}: {data?.grades?.length || 0} {t("grades")}
          </p>
        )}
        className="grade-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this grade?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListGrades;