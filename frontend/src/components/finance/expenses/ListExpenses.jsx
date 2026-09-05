// src/components/finance/expenses/ListExpenses.jsx
//
// Full expense list — filterable by category and date range, with
// per-category totals as stat cards. Edit/Delete follow the same
// ActionButtons + ConfirmationModal pattern as ListStudents. "Added by"
// / "Edited by" come from the audit trail on each record.
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AdminLayout from "../../layout/AdminLayout";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import ConfirmationModal from "../../GUI/ConfirmationModal";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import AppInput from "../../GUI/AppInput";
import ActionButtons from "../../GUI/ActionButtons";
import FilterDropdown from "../../GUI/FilterDropdown";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import SelectField from "../../GUI/SelectField";

import {
  useGetExpensesQuery,
  useGetExpenseStatsQuery,
  useDeleteExpenseMutation,
} from "../../../redux/api/expensesApi";
import { EXPENSE_CATEGORIES } from "../../../constants/expenseConstants";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const CATEGORY_ICONS = {
  Electricity: "bolt",
  Maintenance: "tools",
  Books: "book",
  Furniture: "couch",
  Events: "calendar-star",
};

const ListExpenses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setCurrentPage(1), [categoryFilter, dateFrom, dateTo]);

  const { data: statsData, isFetching: statsLoading } = useGetExpenseStatsQuery(
    { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetExpensesQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      category: categoryFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteExpense, { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess }] =
    useDeleteExpenseMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete expense"));
    if (deleteSuccess) {
      toast.success(t("Expense deleted successfully"));
      setShowModal(false);
      setSelectedExpenseId(null);
      refetch();
    }
  }, [error, deleteError, deleteSuccess, t, refetch]);

  const rows = data?.expenses || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const byCategory = statsData?.stats?.byCategory || [];
  const topCategory = byCategory[0];

  const stats = [
    { label: t("Total Expenses"), value: statsData?.stats?.totalCount ?? 0, icon: "receipt", color: "blue" },
    {
      label: t("Total Spent"),
      value: (statsData?.stats?.grandTotal ?? 0).toFixed(2),
      icon: "coins",
      color: "red",
    },
    {
      label: t("Top Category"),
      value: topCategory ? t(topCategory._id) : "-",
      icon: "chart-pie",
      color: "purple",
    },
  ];

  const handleDeleteClick = (id) => {
    setSelectedExpenseId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedExpenseId) deleteExpense(selectedExpenseId);
  };

  const handleEdit = (id) => {
    navigate(`/finance/expenses?id=${id}`);
  };

  const columns = [
    {
      header: t("Category"),
      width: "13%",
      minWidth: "120px",
      render: (_, row) => (
        <span className="inline-flex items-center gap-2 text-sm-custom">
          <i className={`fa fa-${CATEGORY_ICONS[row.category] || "tag"} text-gray-400`}></i>
          {t(row.category)}
        </span>
      ),
    },
    {
      header: t("Vendor"),
      width: "16%",
      minWidth: "150px",
      render: (_, row) => <TruncatedCell maxChars={30}>{row.vendor || "-"}</TruncatedCell>,
    },
    {
      header: t("Description"),
      width: "20%",
      minWidth: "180px",
      render: (_, row) => <TruncatedCell maxChars={40}>{row.description || "-"}</TruncatedCell>,
    },
    {
      header: t("Amount"),
      width: "10%",
      minWidth: "110px",
      render: (_, row) => <span className="font-medium text-red-600">{Number(row.amount).toFixed(2)}</span>,
    },
    { header: t("Payment Method"), width: "12%", minWidth: "130px", render: (_, row) => t(row.paymentMethod) },
    { header: t("Date"), width: "10%", minWidth: "110px", render: (_, row) => formatDate(row.date) },
    {
      header: t("Added By"),
      width: "12%",
      minWidth: "140px",
      render: (_, row) => (
        <TruncatedCell maxChars={25}>
          {row.audit?.createdBy?.fullName || "-"}
        </TruncatedCell>
      ),
    },
    {
      header: t("Action"),
      width: "7%",
      minWidth: "100px",
      render: (_, row) => (
        <ActionButtons id={row._id} onDelete={handleDeleteClick} isDeleteLoading={isDeleteLoading} onEdit={handleEdit} />
      ),
    },
  ];

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
        setCategoryFilter("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      <SelectField
        label={t("Category")}
        value={categoryFilter}
        onChange={setCategoryFilter}
        placeholder={t("All Categories")}
        options={EXPENSE_CATEGORIES}
        optionLabel={(c) => t(c)}
      />
      <AppInput label={t("From")} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
      <AppInput label={t("To")} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
    </FilterDropdown>
  );

  const emptyState = (
    <EmptyState
      icon="file-invoice"
      title={searchTerm || categoryFilter ? t("No expenses found matching your search") : t("No expenses recorded yet")}
      message={t("Record your first expense to see it here.")}
    />
  );

  const refreshButton = (
    <AppButton
      onClick={() => {
        refetch();
        toast.success(t("Refreshed"));
      }}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching || statsLoading}
      className="ml-2"
    />
  );

  const addButton = (
    <AppButton onClick={() => navigate("/finance/expenses")} label={t("New Expense")} icon="plus" />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Expenses")} />

      <div className="max-w-6xl mx-auto">
        <DataTableContainer
          title={t("Expense Records")}
          subtitle={t("Utilities, maintenance, supplies, and other one-off school expenses")}
          data={rows}
          columns={columns}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={paginationMeta}
          currentPage={paginationMeta.page}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          search={search}
          setSearch={setSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder={t("Search by vendor or description...")}
          onRefresh={refetch}
          refreshButton={refreshButton}
          addButton={addButton}
          emptyState={emptyState}
          filters={filters}
          stats={stats}
          renderHeaderInfo={() => (
            <p className="text-sm-custom text-dark-light mt-1">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("expenses")}
            </p>
          )}
          showSearch={true}
          showStats={true}
          showPagination={true}
        />
      </div>

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this expense record?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListExpenses;