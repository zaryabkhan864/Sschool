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

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import RefreshButton from "../layout/RefreshButton";
import AdminLayout from "../GUI/AdminLayout";

// Reusable components
import FormSection from "../../components/GUI/FormSection";
import FormInput from "../../components/GUI/FormInput";
import FormCheckbox from "../../components/GUI/FormCheckbox";
import FormActions from "../../components/GUI/FormActions";
import TableRowActions from "../../components/GUI/TableRowActions";
import StatsCards from "../../components/GUI/StatsCards";

const CreateWeekDay = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // ---------- Form State ----------
  const [weekDay, setWeekDay] = useState({
    name: "",
    shortName: "",
    order: "",
    isWorkingDay: true,
  });

  // ---------- Table & UI State ----------
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);

  // ---------- Debounced Search ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ---------- RTK Queries & Mutations ----------
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetWeekDaysQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
    paginate: "true", // backend pagination enable
  });

  const [createWeekDay, { isLoading: createLoading, isSuccess: createSuccess, error: createError }] =
    useCreateWeekDayMutation();
  const [updateWeekDay, { isLoading: updateLoading, isSuccess: updateSuccess, error: updateError }] =
    useUpdateWeekDayMutation();
  const [deleteWeekDay, { isLoading: deleteLoading, isSuccess: deleteSuccess, error: deleteError }] =
    useDeleteWeekDayMutation();

  const { name, shortName, order, isWorkingDay } = weekDay;

  // ---------- Handle API Responses ----------
  useEffect(() => {
    if (createError || updateError || deleteError) {
      const err = createError || updateError || deleteError;
      toast.error(err?.data?.message || t("Something went wrong"));
    }
    if (createSuccess) {
      toast.success(t("Week day created successfully"));
      resetForm();
      refetch();
    }
    if (updateSuccess) {
      toast.success(t("Week day updated successfully"));
      resetForm();
      refetch();
    }
    if (deleteSuccess) {
      toast.success(t("Week day deleted successfully"));
      setShowModal(false);
      setSelectedDayId(null);
      refetch();
    }
  }, [createError, updateError, deleteError, createSuccess, updateSuccess, deleteSuccess, t, refetch]);

  // ---------- Handlers ----------
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWeekDay((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setWeekDay({
      name: "",
      shortName: "",
      order: "",
      isWorkingDay: true,
    });
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
      updateWeekDay({ id: editId, body: payload });
    } else {
      createWeekDay(payload);
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

  const confirmDelete = () => {
    if (selectedDayId) {
      deleteWeekDay(selectedDayId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // ---------- Table Columns ----------
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
            val
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {val ? t("Yes") : t("No")}
        </span>
      ),
    },
  ];

  // ---------- Row Actions ----------
  const renderRowActions = (row) => (
    <TableRowActions
      itemId={row._id}
      onEdit={() => handleEdit(row)}
      onDelete={() => handleDeleteClick(row._id)}
      isDeleteLoading={deleteLoading}
      userRole={user?.role}
      requiredRole="admin"
      showView={false}
      showEdit={true}
      showDelete={true}
      customActions={[]}
    />
  );

  // ---------- Stats Cards ----------
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

  // ---------- Add Button ----------
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

  // ---------- Empty State ----------
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-calendar-alt text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {searchTerm
          ? t("No week days found")
          : t("No week days created yet")}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {t("Get started by creating your first week day using the form above.")}
      </p>
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Week Day") : t("Create Week Day")} />

      {/* ---------- Form Section ---------- */}
      <FormSection
        title={editMode ? t("Edit Week Day") : t("Create New Week Day")}
        icon={editMode ? "edit" : "plus-circle"}
        iconColor="blue"
        border={true}
        background="white"
        padding="p-6"
        className="mb-8 shadow-sm"
      >
        <form onSubmit={submitHandler}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormInput
              label={t("Full Name")}
              name="name"
              value={name}
              onChange={onChange}
              placeholder={t("e.g., Monday")}
              required={true}
              className="md:col-span-1"
            />

            <FormInput
              label={t("Short Name")}
              name="shortName"
              value={shortName}
              onChange={onChange}
              placeholder={t("e.g., Mon")}
              required={true}
              className="md:col-span-1"
            />

            <FormInput
              label={t("Order")}
              name="order"
              value={order}
              onChange={onChange}
              placeholder={t("1–7")}
              required={true}
              type="number"
              min="1"
              max="7"
              className="md:col-span-1"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <FormCheckbox
              label={t("Working Day")}
              name="isWorkingDay"
              checked={isWorkingDay}
              onChange={onChange}
              className="text-sm"
            />

            <FormActions
              onSubmit={submitHandler}
              onCancel={editMode ? resetForm : undefined}
              submitLabel={editMode ? t("Update Day") : t("Save Day")}
              cancelLabel={t("Cancel")}
              isLoading={createLoading || updateLoading}
              submitIcon={editMode ? "save" : "plus"}
              cancelIcon="times"
              submitColor="blue"
              cancelColor="gray"
              align="right"
              showCancel={editMode}
            />
          </div>
        </form>
      </FormSection>

      {/* ---------- Stats Cards ---------- */}
      <StatsCards stats={stats} columns={4} className="mb-6" />

      {/* ---------- Data Table Container ---------- */}
      <DataTableContainer
        title={t("Week Days")}
        subtitle={t("View and manage your organization's week days")}
        data={data?.days || []}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        // Pagination
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        // Search
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search by name or short name...")}
        // Actions
        onRefresh={handleRefresh}
        refreshButton={<RefreshButton onClick={handleRefresh} disabled={isFetching} />}
        addButton={addButton}
        emptyState={emptyState}
        userRole={user?.role}
        // Row actions
        renderRowActions={renderRowActions}
        // Header info
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {editMode
              ? t("Edit mode active - Scroll up to see form")
              : t("Fill the form above to create new week days")}
          </p>
        )}
        // Custom styling
        showSearch={true}
        showStats={false}
        showPagination={true}
        className="weekday-table"
      />

      {/* ---------- Confirmation Modal ---------- */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={deleteLoading}
        message={t("Are you sure you want to delete this week day? This action cannot be undone.")}
        title={t("Delete Week Day")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        confirmColor="red"
      />
    </AdminLayout>
  );
};

export default CreateWeekDay;