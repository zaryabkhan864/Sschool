// components/exam/ListExams.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useDeleteExamMutation, useGetExamsQuery } from "../../redux/api/examApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";

const ListExams = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error, refetch, isFetching } = useGetExamsQuery(
    { page: currentPage, limit, keyword: searchTerm },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteExam, { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess }] =
    useDeleteExamMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete exam"));
    if (deleteSuccess) {
      toast.success(t("Exam deleted"));
      setShowModal(false);
      setSelectedId(null);
    }
  }, [error, deleteError, deleteSuccess, t]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedId) deleteExam(selectedId);
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
      render: (value, row) => (
        <div>
          <TruncatedCell maxChars={45}>{value}</TruncatedCell>
          <span className="text-xs text-gray-400">Exam #{row.examNumber}</span>
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
      width: "15%",
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
      header: t("Date"),
      accessor: "date",
      width: "15%",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      header: t("Structure"),
      accessor: "totalQuestions",
      width: "15%",
      render: (value, row) => (
        <span className="text-xs text-gray-600">
          {value} × {row.marksPerQuestion} = {row.totalMarks} {t("marks")}
        </span>
      ),
    },
    {
      header: t("Students"),
      accessor: "marks",
      width: "10%",
      render: (value) => value?.length ?? 0,
    },
  ];

  const stats = [
    { label: t("Total Exams"), value: data?.pagination?.total || 0, icon: "file-alt", color: "blue" },
    { label: t("Items Shown"), value: data?.exams?.length || 0, icon: "list-ul", color: "purple" },
    { label: t("Total Pages"), value: data?.pagination?.totalPages || 1, icon: "file-alt", color: "orange" },
  ];

  const addButton = <AppButton to="/teacher/exam/new" label={t("New / Fetch Exam")} icon="plus" />;

  const refreshButton = (
    <AppButton onClick={handleRefresh} text={t("Refresh")} icon="sync-alt" disabled={isFetching} className="ml-2" />
  );

  const renderRowActions = (row) => (
    <div className="flex items-center gap-2">
      <AppButton
        onClick={() => navigate(`/teacher/exam/${row._id}`)}
        text={t("Edit Marks")}
        icon="edit"
        variant="secondary"
        className="text-xs"
      />
      <button onClick={() => handleDeleteClick(row._id)} className="text-red-500 hover:text-red-700 text-sm px-2">
        <i className="fa fa-trash"></i>
      </button>
    </div>
  );

  const emptyState = (
    <EmptyState
      icon="file-alt"
      title={searchTerm ? t("No exams found matching your search") : t("No exams yet")}
      message={t("Create a new exam to get started.")}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Exams")} />

      <DataTableContainer
        title={t("Exams")}
        subtitle={t("Manage exam marks for your classes")}
        data={data?.exams || []}
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
        stats={stats}
        userRole="teacher"
        renderRowActions={renderRowActions}
        className="exam-table-container"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this exam? All recorded marks will be lost.")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListExams;
