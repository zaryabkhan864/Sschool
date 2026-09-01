// components/homework/ListHomeworkTeacher.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  useDeleteHomeworkAssignmentMutation,
  useGetHomeworkAssignmentsQuery,
  useGetTeacherClassGroupsAndCoursesQuery,
} from "../../redux/api/homeworkApi";

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
import SearchableDropdown from "../layout/SearchableDropdown";

const typeBadge = (type, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  return type === "assignment" ? (
    <span className={`${base} bg-purple-100 text-purple-800`}>{t("Assignment")}</span>
  ) : (
    <span className={`${base} bg-blue-100 text-blue-800`}>{t("Homework")}</span>
  );
};

const statusBadge = (status, t) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  return status ? (
    <span className={`${base} bg-green-100 text-green-800`}>{t("active")}</span>
  ) : (
    <span className={`${base} bg-gray-100 text-gray-800`}>{t("inactive")}</span>
  );
};

const ListHomeworkTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [classGroupFilter, setClassGroupFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: roleData } = useGetTeacherClassGroupsAndCoursesQuery();

  const classGroupOptions = useMemo(
    () => [
      { value: "", label: t("All Class Groups") },
      ...(roleData?.classGroups || []).map((cg) => ({ value: cg._id, label: cg.displayName })),
    ],
    [roleData, t]
  );

  const { data, isLoading, error, refetch, isFetching } = useGetHomeworkAssignmentsQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm,
      classGroup: classGroupFilter || undefined,
      type: typeFilter || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteHomeworkAssignment, { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess }] =
    useDeleteHomeworkAssignmentMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete"));
    if (deleteSuccess) {
      toast.success(t("Deleted successfully"));
      setShowModal(false);
      setSelectedId(null);
    }
  }, [error, deleteError, deleteSuccess, t]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedId) deleteHomeworkAssignment(selectedId);
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  const columns = [
    {
      header: t("Title"),
      accessor: "title",
      width: "30%",
      minWidth: "180px",
      render: (value, row) => (
        <div>
          <TruncatedCell maxChars={45}>{value}</TruncatedCell>
          <div className="mt-1">{typeBadge(row.type, t)}</div>
        </div>
      ),
    },
    {
      header: t("Class Group"),
      accessor: "classGroup",
      width: "15%",
      render: (value) => value?.displayName || <span className="text-gray-400 italic">{t("N/A")}</span>,
    },
    {
      header: t("Course"),
      accessor: "course",
      width: "20%",
      render: (value) =>
        value ? (
          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            {value.code}
          </span>
        ) : (
          <span className="text-gray-400 italic">{t("N/A")}</span>
        ),
    },
    {
      header: t("Due Date"),
      accessor: "dueDate",
      width: "15%",
      render: (value) => (value ? new Date(value).toLocaleString() : "—"),
    },
    {
      header: t("Target"),
      accessor: "targetType",
      width: "10%",
      render: (value) =>
        value === "individual" ? (
          <span className="text-xs text-gray-600">{t("Individual")}</span>
        ) : (
          <span className="text-xs text-gray-600">{t("All students")}</span>
        ),
    },
    {
      header: t("Status"),
      accessor: "status",
      width: "10%",
      render: (value) => statusBadge(value, t),
    },
  ];

  const stats = [
    { label: t("Total Postings"), value: data?.pagination?.total || 0, icon: "tasks", color: "blue" },
    {
      label: t("Active"),
      value: data?.pagination?.counts?.active ?? 0,
      icon: "check-circle",
      color: "green",
    },
    { label: t("Items Shown"), value: data?.homeworks?.length || 0, icon: "list-ul", color: "purple" },
    { label: t("Total Pages"), value: data?.pagination?.totalPages || 1, icon: "file-alt", color: "orange" },
  ];

  const addButton = (
    <AppButton to="/teacher/homework/new" label={t("New Homework/Assignment")} icon="plus" />
  );

  const refreshButton = (
    <AppButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} className="ml-2" />
  );

  const filters = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-48">
        <SearchableDropdown
          value={classGroupFilter}
          options={classGroupOptions}
          onChange={(val) => {
            setClassGroupFilter(val);
            setCurrentPage(1);
          }}
          placeholder={t("All Class Groups")}
        />
      </div>
      <select
        value={typeFilter}
        onChange={(e) => {
          setTypeFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="">{t("All Types")}</option>
        <option value="homework">{t("Homework")}</option>
        <option value="assignment">{t("Assignment")}</option>
      </select>
      <FilterDropdown
        limit={limit}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setCurrentPage(1);
        }}
        onReset={() => {
          setSearch("");
          setSearchTerm("");
          setClassGroupFilter("");
          setTypeFilter("");
          setCurrentPage(1);
          setLimit(8);
        }}
      />
    </div>
  );

  const renderRowActions = (row) => (
    <div className="flex items-center gap-2">
      <AppButton
        onClick={() => navigate(`/teacher/homework/${row._id}/submissions`)}
        text={t("Submissions")}
        icon="inbox"
        variant="secondary"
        className="text-xs"
      />
      <ActionButtons
        id={row._id}
        userRole="teacher"
        onDelete={handleDeleteClick}
        isDeleteLoading={isDeleteLoading}
        editHref={`/teacher/homework/${row._id}/edit`}
        onView={(id) => navigate(`/teacher/homework/${id}`)}
      />
    </div>
  );

  const emptyState = (
    <EmptyState
      icon="tasks"
      title={searchTerm ? t("No postings found matching your search") : t("No homework or assignments yet")}
      message={t("Create a new posting to get started.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Homework & Assignments")} />

      <DataTableContainer
        title={t("Homework & Assignments")}
        subtitle={t("Manage what you've posted to your classes")}
        data={data?.homeworks || []}
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
        searchPlaceholder={t("Search by title...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole="teacher"
        renderRowActions={renderRowActions}
        className="homework-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this posting? All student submissions for it will also be removed.")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListHomeworkTeacher;
