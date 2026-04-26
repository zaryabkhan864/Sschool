import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  useGetAcademicLevelsQuery,
  useCreateAcademicLevelMutation,
  useUpdateAcademicLevelMutation,
  useDeleteAcademicLevelMutation,
} from "../../redux/api/academicLevelApi";

// Core Layout & UI Components
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppCheckbox from "../GUI/AppCheckbox";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import ActionButtons from "../GUI/ActionButtons";
import EmptyState from "../GUI/EmptyState";

const NewAcademicLevel = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // ------------- GET CURRENT ACADEMIC YEAR & CAMPUS FROM REDUX -------------
  // Adjust these selectors to match your actual store shape.
  // For example, state.academicYear.currentAcademicYear could be an ID string.
  const academicYear = useSelector(
    (state) => state.academicYear?.currentAcademicYear
  );
  const campus = useSelector((state) => state.campus?.currentCampus);

  // ------------------ Form State ------------------
  const [academicLevel, setAcademicLevel] = useState({
    name: "",
    code: "",
    order: "",
    status: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // ------------------ Table & UI State ------------------
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(null);

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
  } = useGetAcademicLevelsQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm,
      academicYear,       //  <-- passed explicitly
      campus,             //  <-- passed explicitly
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createAcademicLevel, { isLoading: createLoading }] =
    useCreateAcademicLevelMutation();
  const [updateAcademicLevel, { isLoading: updateLoading }] =
    useUpdateAcademicLevelMutation();
  const [deleteAcademicLevel, { isLoading: deleteLoading }] =
    useDeleteAcademicLevelMutation();

  const { name, code, order, status } = academicLevel;

  // ------------------ Side Effects (API feedback) ------------------
  useEffect(() => {
    if (fetchError) {
      toast.error(fetchError?.data?.message || t("Failed to load academic levels"));
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
    setAcademicLevel((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setAcademicLevel({ name: "", code: "", order: "", status: true });
    setEditMode(false);
    setEditId(null);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !code.trim() || !order) {
      toast.error(t("Please fill all required fields"));
      return;
    }

    const payload = {
      ...academicLevel,
      code: code.toUpperCase(),
      order: parseInt(order, 10),
    };

    if (editMode) {
      handleMutationResponse(
        updateAcademicLevel({ id: editId, body: payload }),
        "Academic Level updated successfully"
      );
    } else {
      handleMutationResponse(
        createAcademicLevel(payload),
        "Academic Level created successfully"
      );
    }
  };

  const handleEdit = (level) => {
    setAcademicLevel({
      name: level.name,
      code: level.code,
      order: level.order.toString(),
      status: level.status,
    });
    setEditMode(true);
    setEditId(level._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id) => {
    setSelectedLevelId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedLevelId) return;
    try {
      const result = await deleteAcademicLevel(selectedLevelId);
      if (result.error) {
        toast.error(result.error.data?.message || t("Failed to delete"));
      } else {
        toast.success(t("Academic Level deleted successfully"));
        setShowModal(false);
        setSelectedLevelId(null);
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
      header: t("Name"),
      accessor: "name",
      width: "30%",
      render: (val) => <span className="font-medium text-gray-800">{val}</span>,
    },
    {
      header: t("Code"),
      accessor: "code",
      width: "20%",
      render: (val) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
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
      header: t("Status"),
      accessor: "status",
      width: "20%",
      render: (val) => <AppBadge type="booleanStatus" active={val} />,
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

  // ------------------ Derived pagination object ------------------
  const totalFiltered = data?.filteredCount || 0;
  const pagination = {
    total: totalFiltered,
    totalPages: totalFiltered > 0 ? Math.ceil(totalFiltered / limit) : 1,
    currentPage,
    resPerPage: limit,
  };

  // ------------------ Stats for DataTableContainer ------------------
  const stats = [
    {
      label: t("Total Levels"),
      value: totalFiltered,
      icon: "layer-group",
      color: "blue",
    },
    {
      label: t("Active"),
      value: data?.levels?.filter((l) => l.status).length || 0,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Items Shown"),
      value: data?.levels?.length || 0,
      icon: "list-ul",
      color: "purple",
    },
    {
      label: t("Total Pages"),
      value: pagination.totalPages,
      icon: "file-alt",
      color: "orange",
    },
  ];

  // Custom empty state
  const emptyState = (
    <EmptyState
      icon="layer-group"
      title={
        searchTerm
          ? t("No academic levels found")
          : t("No academic levels created yet")
      }
      message={t(
        "Get started by creating your first academic level using the form above."
      )}
    />
  );

  // Custom header info (optional)
  const renderHeaderInfo = () => (
    <p className="text-sm text-gray-500 mt-1">
      <i className="fa fa-info-circle mr-2"></i>
      {editMode
        ? t("Edit mode active – Scroll up to see the form")
        : t("Fill the form above to create new academic levels")}
    </p>
  );

  // Add button (scrolls to form) using AppButton
  const addButton = (
    <AppButton
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      label={editMode ? t("Edit Mode Active") : t("Scroll to Form")}
      icon={editMode ? "fa-edit" : "fa-arrow-up"}
      disabled={editMode}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Academic Level") : t("Academic Levels")} />

      {/* ---------- Form Card ---------- */}
      <div className="max-w-6xl mx-auto py-4 px-4 animate-fade-in">
        <AppCard
          title={editMode ? t("Edit Academic Level") : t("Create New Academic Level")}
          icon={editMode ? "fa-edit" : "fa-plus-circle"}
          className="mb-8 animate-slide-up"
        >
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AppInput
                label={t("Name")}
                name="name"
                value={name}
                onChange={onChange}
                placeholder={t("Enter academic level name")}
                required
              />
              <AppInput
                label={t("Code")}
                name="code"
                value={code}
                onChange={onChange}
                placeholder={t("Enter code (e.g., GRD-1)")}
                required
                helperText={t("Will be converted to uppercase")}
              />
              <AppInput
                label={t("Order")}
                name="order"
                value={order}
                onChange={onChange}
                placeholder={t("Enter display order")}
                required
                type="number"
                min="1"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <AppCheckbox
                name="status"
                checked={status}
                onChange={onChange}
                label={t("Active Status")}
              />

              <div className="flex gap-2">
                {editMode && (
                  <AppButton
                    label={t("Cancel")}
                    onClick={resetForm}
                    icon="fa-times"
                    variant="outline"
                  />
                )}
                <AppButton
                  label={editMode ? t("Update Level") : t("Save Level")}
                  isLoading={createLoading || updateLoading}
                  icon={editMode ? "fa-save" : "fa-plus"}
                  type="submit"
                />
              </div>
            </div>
          </form>
        </AppCard>

        {/* ---------- Data Table ---------- */}
        <DataTableContainer
          title={t("Academic Levels")}
          subtitle={t("View and manage your organization's academic structures")}
          data={data?.levels || []}
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
          searchPlaceholder={t("Search by name or code...")}
          onRefresh={handleRefresh}
          refreshButton={<AppButton onClick={handleRefresh} disabled={isFetching} icon="fa-sync-alt" />}
          addButton={addButton}
          emptyState={emptyState}
          userRole={user?.role}
          renderRowActions={renderRowActions}
          renderHeaderInfo={renderHeaderInfo}
          stats={stats}
          showSearch={true}
          showStats={true}
          showPagination={true}
          className="academic-levels-table"
        />

        {/* ---------- Delete Confirmation Modal ---------- */}
        <ConfirmationModal
          showModal={showModal}
          setShowModal={setShowModal}
          confirmDelete={confirmDelete}
          isDeleteLoading={deleteLoading}
          message={t(
            "Are you sure you want to delete this academic level? This action cannot be undone."
          )}
          title={t("Delete Academic Level")}
          confirmText={t("Delete")}
          cancelText={t("Cancel")}
          confirmColor="red"
        />
      </div>
    </AdminLayout>
  );
};

export default NewAcademicLevel;