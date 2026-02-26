import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  useGetWeekDaysQuery,
  useCreateWeekDayMutation,
  useUpdateWeekDayMutation,
  useDeleteWeekDayMutation,
} from "../../redux/api/weekDayApi";

// Core Layout & UI Components (same as in NewAcademicLevel)
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppButton from "../GUI/AppButton";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import ActionButtons from "../GUI/ActionButtons";
import EmptyState from "../GUI/EmptyState";

const CreateWeekDay = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // ------------------ Form State ------------------
  const [weekDay, setWeekDay] = useState({
    name: "",
    shortName: "",
    order: "",
    isWorkingDay: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // ------------------ Table & UI State ------------------
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ------------------ RTK Queries ------------------
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error: fetchError,
  } = useGetWeekDaysQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm,
      paginate: "true", // if needed
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createWeekDay, { isLoading: createLoading }] =
    useCreateWeekDayMutation();
  const [updateWeekDay, { isLoading: updateLoading }] =
    useUpdateWeekDayMutation();
  const [deleteWeekDay, { isLoading: deleteLoading }] =
    useDeleteWeekDayMutation();

  const { name, shortName, order, isWorkingDay } = weekDay;

  // ------------------ Side Effects (API feedback) ------------------
  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError?.data?.message || t("Failed to load week days"));
    }
  }, [fetchError, t]);

  // Handlers for mutation responses (success/error)
  const handleMutationResponse = async (promise, successMessage) => {
    try {
      const result = await promise;
      if (result.error) {
        toast.error(result.error.data?.message || t("Operation failed"));
      } else {
        toast.success(t(successMessage));
        resetForm();
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || t("Something went wrong"));
    }
  };

  // ------------------ Form Handlers ------------------
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWeekDay((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setWeekDay({ name: "", shortName: "", order: "", isWorkingDay: true });
    setEditMode(false);
    setEditId(null);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !shortName.trim() || !order) {
      toast.error(t("Please fill all required fields"));
      return;
    }

    const payload = {
      ...weekDay,
      order: parseInt(order, 10),
    };

    if (editMode) {
      handleMutationResponse(
        updateWeekDay({ id: editId, body: payload }),
        "Week day updated successfully"
      );
    } else {
      handleMutationResponse(
        createWeekDay(payload),
        "Week day created successfully"
      );
    }
  };

  const handleEdit = (day) => {
    setWeekDay({
      name: day.name,
      shortName: day.shortName,
      order: day.order.toString(),
      isWorkingDay: day.isWorkingDay,
    });
    setEditMode(true);
    setEditId(day._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id) => {
    setSelectedDayId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDayId) return;
    try {
      const result = await deleteWeekDay(selectedDayId);
      if (result.error) {
        toast.error(result.error.data?.message || t("Failed to delete"));
      } else {
        toast.success(t("Week day deleted successfully"));
        setShowModal(false);
        setSelectedDayId(null);
        refetch();
      }
    } catch (err) {
      toast.error(err?.data?.message || t("Something went wrong"));
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // ------------------ Table Columns ------------------
  const columns = [
    {
      header: t("Full Name"),
      accessor: "name",
      width: "30%",
      render: (val) => <span className="font-medium text-gray-800">{val}</span>,
    },
    {
      header: t("Short Name"),
      accessor: "shortName",
      width: "20%",
      render: (val) => (
        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">
          {val}
        </span>
      ),
    },
    {
      header: t("Order"),
      accessor: "order",
      width: "20%",
      render: (val) => <span className="font-semibold text-gray-700">{val}</span>,
    },
    {
      header: t("Working Day"),
      accessor: "isWorkingDay",
      width: "20%",
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            val ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {val ? t("Yes") : t("No")}
        </span>
      ),
    },
  ];

  // Row actions using ActionButtons component
  const renderRowActions = (row) => (
    <ActionButtons
      id={row._id}
      userRole={user?.role}
      requiredRole="admin"
      onEdit={() => handleEdit(row)}
      onDelete={() => handleDeleteClick(row._id)}
      isDeleteLoading={deleteLoading}
      showView={false}
    />
  );

  // ------------------ Stats for DataTableContainer ------------------
  const stats = [
    {
      label: t("Total Days"),
      value: data?.pagination?.total || 0,
      icon: "calendar-alt",
      color: "blue",
    },
    {
      label: t("Working Days"),
      value: data?.days?.filter((d) => d.isWorkingDay).length || 0,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Non‑Working Days"),
      value: data?.days?.filter((d) => !d.isWorkingDay).length || 0,
      icon: "times-circle",
      color: "gray",
    },
    {
      label: t("Items Shown"),
      value: data?.days?.length || 0,
      icon: "list-ul",
      color: "purple",
    },
  ];

  // Custom empty state
  const emptyState = (
    <EmptyState
      icon="calendar-alt"
      title={
        searchTerm
          ? t("No week days found")
          : t("No week days created yet")
      }
      message={t(
        "Get started by creating your first week day using the form above."
      )}
    />
  );

  // Custom header info (optional)
  const renderHeaderInfo = () => (
    <p className="text-sm text-gray-500 mt-1">
      <i className="fa fa-info-circle mr-2"></i>
      {editMode
        ? t("Edit mode active – Scroll up to see the form")
        : t("Fill the form above to create new week days")}
    </p>
  );

  // Add button (scrolls to form)
  const addButton = (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md flex items-center gap-2"
    >
      <i className="fa fa-plus"></i>
      {editMode ? t("Edit Mode Active") : t("Scroll to Form")}
    </button>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Week Day") : t("Create Week Day")} />

      {/* ---------- Form Card ---------- */}
      <div className="max-w-6xl mx-auto py-4 px-4">
        <AppCard
          title={editMode ? t("Edit Week Day") : t("Create New Week Day")}
          icon={editMode ? "edit" : "plus-circle"}
          className="mb-8"
        >
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AppInput
                label={t("Full Name")}
                name="name"
                value={name}
                onChange={onChange}
                placeholder={t("e.g., Monday")}
                required
              />
              <AppInput
                label={t("Short Name")}
                name="shortName"
                value={shortName}
                onChange={onChange}
                placeholder={t("e.g., Mon")}
                required
              />
              <AppInput
                label={t("Order")}
                name="order"
                value={order}
                onChange={onChange}
                placeholder={t("1–7")}
                required
                type="number"
                min="1"
                max="7"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <AppCheckbox
                name="isWorkingDay"
                checked={isWorkingDay}
                onChange={onChange}
                label={t("Working Day")}
              />

              <div className="flex gap-2">
                {editMode && (
                  <AppButton
                    label={t("Cancel")}
                    onClick={resetForm}
                    icon="times"
                  />
                )}
                <AppButton
                  label={editMode ? t("Update Day") : t("Save Day")}
                  isLoading={createLoading || updateLoading}
                  icon={editMode ? "save" : "plus"}
                />
              </div>
            </div>
          </form>
        </AppCard>

        {/* ---------- Data Table ---------- */}
        <DataTableContainer
          title={t("Week Days")}
          subtitle={t("View and manage your organization's week days")}
          data={data?.days || []}
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
          searchPlaceholder={t("Search by name or short name...")}
          onRefresh={handleRefresh}
          refreshButton={<AppButton onClick={handleRefresh} disabled={isFetching} />}
          addButton={addButton}
          emptyState={emptyState}
          userRole={user?.role}
          renderRowActions={renderRowActions}
          renderHeaderInfo={renderHeaderInfo}
          stats={stats}
          showSearch={true}
          showStats={true}
          showPagination={true}
          className="weekday-table"
        />

        {/* ---------- Delete Confirmation Modal ---------- */}
        <ConfirmationModal
          showModal={showModal}
          setShowModal={setShowModal}
          confirmDelete={confirmDelete}
          isDeleteLoading={deleteLoading}
          message={t(
            "Are you sure you want to delete this week day? This action cannot be undone."
          )}
          title={t("Delete Week Day")}
          confirmText={t("Delete")}
          cancelText={t("Cancel")}
          confirmColor="red"
        />
      </div>
    </AdminLayout>
  );
};

export default CreateWeekDay;