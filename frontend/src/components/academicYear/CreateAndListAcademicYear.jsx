import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

import {
  useCreateAcademicYearMutation,
  useDeleteAcademicYearMutation,
  useGetAcademicYearsQuery,
  useUpdateAcademicYearMutation,
} from "../../redux/api/academicYearApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";
import { DataTableContainer } from "../GUI/DataTableContainer";
import ConfirmationModal from "../GUI/ConfirmationModal";
import ActionButtons from "../GUI/ActionButtons";
import EmptyState from "../GUI/EmptyState";
import FilterDropdown from "../GUI/FilterDropdown";

const CreateAndListAcademicYear = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // ---------- Form state ----------
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // ---------- Table & filter state ----------
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ---------- API ----------
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error: fetchError,
  } = useGetAcademicYearsQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm,
      // "current" → isCurrent=true | "notCurrent" → isCurrent=false | "" → undefined (no filter)
      isCurrent:
        statusFilter === "current"
          ? true
          : statusFilter === "notCurrent"
          ? false
          : undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createAcademicYear, { isLoading: isCreating }] = useCreateAcademicYearMutation();
  const [updateAcademicYear, { isLoading: isUpdating }] = useUpdateAcademicYearMutation();
  const [deleteAcademicYear, { isLoading: isDeleting }] = useDeleteAcademicYearMutation();

  const academicYears = data?.academicYears || [];
  const pagination = data?.pagination;

  // ✅ FIX 1: Backend returns pagination.counts.{total, current, notCurrent}
  // pagination.total is only current page count — use counts.total for real total
  const counts = pagination?.counts || data?.counts || {
    total: 0,
    current: 0,
    notCurrent: 0,
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [yearToDelete, setYearToDelete] = useState(null);

  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError?.data?.message || t("Failed to load academic years"));
    }
  }, [fetchError, t]);

  // ---------- Form handlers ----------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", startDate: "", endDate: "", isCurrent: false });
    setEditMode(false);
    setEditId(null);
  };

  // ✅ FIX 2: Generic error handler — no hardcoded backend message strings
  const handleMutation = async (mutationPromise, successMsg) => {
    try {
      const result = await mutationPromise;
      if (result.error) {
        toast.error(result.error.data?.message || t("Operation failed"));
      } else {
        toast.success(t(successMsg));
        resetForm();
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || t("Something went wrong"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error(t("Please enter academic year name"));
    }
    // ✅ FIX 3: startDate & endDate are now required in model — validate before submit
    if (!formData.startDate) {
      return toast.error(t("Please enter a start date"));
    }
    if (!formData.endDate) {
      return toast.error(t("Please enter an end date"));
    }

    const payload = { ...formData };

    if (editMode) {
      await handleMutation(
        updateAcademicYear({ id: editId, ...payload }),
        "Academic year updated successfully"
      );
    } else {
      await handleMutation(
        createAcademicYear(payload),
        "Academic year created successfully"
      );
    }
  };

  const handleEdit = (year) => {
    setFormData({
      name: year.name,
      startDate: year.startDate ? year.startDate.slice(0, 10) : "",
      endDate: year.endDate ? year.endDate.slice(0, 10) : "",
      isCurrent: year.isCurrent,
    });
    setEditMode(true);
    setEditId(year._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id) => {
    setYearToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!yearToDelete) return;
    try {
      const result = await deleteAcademicYear(yearToDelete);
      if (result.error) {
        toast.error(result.error.data?.message || t("Failed to delete"));
      } else {
        toast.success(t("Academic year deleted successfully"));
        setShowDeleteModal(false);
        setYearToDelete(null);
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || t("Something went wrong"));
    }
  };

  // ✅ FIX 4: handleSetCurrent — send undefined (not "") for missing dates
  // Previously empty string fallback caused backend required validation to fail
  const handleSetCurrent = async (year) => {
    if (year.isCurrent) {
      toast(t("This year is already current"), { icon: "ℹ️" });
      return;
    }
    try {
      const result = await updateAcademicYear({
        id: year._id,
        name: year.name,
        startDate: year.startDate ? year.startDate.slice(0, 10) : undefined,
        endDate: year.endDate ? year.endDate.slice(0, 10) : undefined,
        isCurrent: true,
      });
      if (result.error) {
        toast.error(result.error.data?.message || t("Failed to set as current"));
      } else {
        toast.success(t("Year set as current successfully"));
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || t("Failed to set as current"));
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // ---------- Table Columns ----------
  const columns = [
    {
      header: t("Name"),
      accessor: "name",
      width: "20%",
      render: (val) => <span className="font-medium text-gray-800">{val}</span>,
    },
    {
      header: t("Start Date"),
      accessor: "startDate",
      width: "15%",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
    {
      header: t("End Date"),
      accessor: "endDate",
      width: "15%",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
    {
      header: t("Status"),
      accessor: "isCurrent",
      width: "15%",
      render: (val) => (
        <AppBadge
          type="booleanStatus"
          active={val}
          activeText={t("Current")}
          inactiveText={t("Not Current")}
        />
      ),
    },
    {
      header: t("Set Current"),
      accessor: "isCurrent",
      width: "15%",
      render: (val, row) => {
        if (val) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i className="fa fa-check-circle mr-1 text-green-600" />
              {t("Current Year")}
            </span>
          );
        }
        return (
          <button
            onClick={() => handleSetCurrent(row)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition"
            title={t("Set as current academic year")}
          >
            <i className="fa fa-arrow-right mr-1" />
            {t("Set as Current")}
          </button>
        );
      },
    },
  ];

  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={user?.role}
      requiredRole="admin"
      onEdit={() => handleEdit(row)}
      onDelete={() => handleDeleteClick(row._id)}
      isDeleteLoading={isDeleting && yearToDelete === row._id}
      showView={false}
    />
  );

  // ✅ FIX 5: Stats use counts.total/current/notCurrent (real totals from backend)
  // Old code used pagination.total which was only the current page count
  const stats = [
    {
      label: t("Total Years"),
      value: counts.total,
      icon: "calendar",
      color: "blue",
    },
    {
      label: t("Current Year"),
      value: counts.current,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Not Current"),
      value: counts.notCurrent,
      icon: "calendar-times",
      color: "gray",
    },
    {
      label: t("Total Pages"),
      value: pagination?.totalPages || 1,
      icon: "file-alt",
      color: "purple",
    },
  ];

  const emptyState = (
    <EmptyState
      icon="calendar-alt"
      title={
        searchTerm
          ? t("No academic years match your search")
          : t("No academic years created yet")
      }
      message={t("Get started by creating your first academic year using the form above.")}
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
        setLimit(10);
      }}
    >
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("Status")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t("All")}</option>
          <option value="current">{t("Current")}</option>
          <option value="notCurrent">{t("Not Current")}</option>
        </select>
      </div>
    </FilterDropdown>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Academic Year") : t("Manage Academic Years")} />

      <div className="max-w-7xl mx-auto py-4 px-4">
        {/* Form Card */}
        <AppCard
          title={editMode ? t("Edit Academic Year") : t("Create New Academic Year")}
          icon={editMode ? "fa-edit" : "fa-plus-circle"}
          className="mb-8 animate-slide-up"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppInput
                label={t("Name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("e.g., 2025-2026")}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <AppInput
                label={t("Start Date")}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <AppInput
                label={t("End Date")}
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex items-center pt-4">
              <AppCheckbox
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleInputChange}
                label={t("Set as current year")}
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-2">
              {editMode && (
                <AppButton
                  label={t("Cancel")}
                  onClick={resetForm}
                  variant="outline"
                  icon="fa-times"
                />
              )}
              <AppButton
                label={editMode ? t("Update Year") : t("Save Year")}
                isLoading={isCreating || isUpdating}
                icon={editMode ? "fa-save" : "fa-plus"}
                type="submit"
              />
            </div>
          </form>
        </AppCard>

        {/* Data Table */}
        <DataTableContainer
          title={t("Academic Years")}
          subtitle={t("View and manage all academic years")}
          data={academicYears}
          columns={columns}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          search={search}
          setSearch={setSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder={t("Search by name or dates...")}
          onRefresh={handleRefresh}
          emptyState={emptyState}
          filters={filters}
          stats={stats}
          showStats={true}
          showPagination={true}
          showSearch={true}
          userRole={user?.role}
          renderRowActions={renderRowActions}
        />

        {/* Delete Modal */}
        <ConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          confirmDelete={confirmDelete}
          isDeleteLoading={isDeleting}
          message={t(
            "Are you sure you want to delete this academic year? This action cannot be undone."
          )}
          title={t("Delete Academic Year")}
          confirmText={t("Delete")}
          cancelText={t("Cancel")}
          confirmColor="red"
        />
      </div>
    </AdminLayout>
  );
};

export default CreateAndListAcademicYear;
