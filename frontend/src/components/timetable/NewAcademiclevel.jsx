import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { 
  useGetAcademicLevelsQuery, 
  useCreateAcademicLevelMutation, 
  useUpdateAcademicLevelMutation,
  useDeleteAcademicLevelMutation 
} from "../../redux/api/academicLevelApi";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import RefreshButton from "../layout/RefreshButton";
import AdminLayout from "../layout/AdminLayout";

// Import reusable components
import FormSection from "../../components/GUI/FormSection";
import FormInput from "../../components/GUI/FormInput";
import FormCheckbox from "../../components/GUI/FormCheckbox";
import FormActions from "../../components/GUI/FormActions";
import TableRowActions from "../../components/GUI/TableRowActions";
import StatsCards from "../../components/GUI/StatsCards";

const NewAcademicLevel = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // Form State
  const [academicLevel, setAcademicLevel] = useState({
    name: "",
    code: "",
    order: "",
    status: true,
  });

  // Table & UI States
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(null);

  // Debounced Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // RTK Queries
  const { data, isLoading, isFetching, refetch } = useGetAcademicLevelsQuery({
    page: currentPage,
    limit,
    keyword: searchTerm,
  });

  const [createAcademicLevel, { isLoading: createLoading, isSuccess: createSuccess, error: createError }] = useCreateAcademicLevelMutation();
  const [updateAcademicLevel, { isLoading: updateLoading, isSuccess: updateSuccess, error: updateError }] = useUpdateAcademicLevelMutation();
  const [deleteAcademicLevel, { isLoading: deleteLoading, isSuccess: deleteSuccess, error: deleteError }] = useDeleteAcademicLevelMutation();

  const { name, code, order, status } = academicLevel;

  // Handle API responses
  useEffect(() => {
    if (createError || updateError || deleteError) {
      const err = createError || updateError || deleteError;
      toast.error(err?.data?.message || t("Something went wrong"));
    }
    if (createSuccess) {
      toast.success(t("Academic Level created successfully"));
      resetForm();
      refetch();
    }
    if (updateSuccess) {
      toast.success(t("Academic Level updated successfully"));
      resetForm();
      refetch();
    }
    if (deleteSuccess) {
      toast.success(t("Academic Level deleted successfully"));
      setShowModal(false);
      setSelectedLevelId(null);
      refetch();
    }
  }, [createError, updateError, deleteError, createSuccess, updateSuccess, deleteSuccess, t, refetch]);

  // Event Handlers
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAcademicLevel({ 
      ...academicLevel, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const resetForm = () => {
    setAcademicLevel({ 
      name: "", 
      code: "", 
      order: "", 
      status: true 
    });
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
      order: parseInt(order),
    };

    if (editMode) {
      updateAcademicLevel({ id: editId, body: payload });
    } else {
      createAcademicLevel(payload);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setSelectedLevelId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedLevelId) {
      deleteAcademicLevel(selectedLevelId);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success(t("Refreshed"));
  };

  // DataTable Columns
  const columns = [
    {
      header: t("Name"),
      accessor: "name",
      width: "30%",
      render: (val) => <span className="font-medium text-gray-800">{val}</span>
    },
    {
      header: t("Code"),
      accessor: "code",
      width: "20%",
      render: (val) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
          {val}
        </span>
      )
    },
    { 
      header: t("Order"), 
      accessor: "order",
      width: "20%",
      render: (val) => <span className="font-semibold text-gray-700">{val}</span>
    },
    { 
      header: t("Status"), 
      accessor: "status",
      width: "20%",
      render: (val) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val ? t("Active") : t("Inactive")}
        </span>
      )
    }
  ];

  // Row Actions
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

  // Stats
  const stats = [
    { 
      label: t("Total Levels"), 
      value: data?.pagination?.total || 0, 
      icon: "layer-group", 
      color: "blue" 
    },
    { 
      label: t("Active"), 
      value: data?.levels?.filter(l => l.status).length || 0, 
      icon: "check-circle", 
      color: "green" 
    },
    { 
      label: t("Items Shown"), 
      value: data?.levels?.length || 0, 
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

  // Add Button
  const addButton = (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md flex items-center gap-2"
    >
      <i className="fa fa-plus"></i>
      {editMode ? t("Edit Mode Active") : t("Scroll to Form")}
    </button>
  );

  // Empty State
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-layer-group text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {searchTerm ? t("No academic levels found") : t("No academic levels created yet")}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {t("Get started by creating your first academic level using the form above.")}
      </p>
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Academic Level") : t("Create Academic Level")} />

      {/* Form Section */}
      <FormSection
        title={editMode ? t("Edit Academic Level") : t("Create New Academic Level")}
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
              label={t("Name")}
              name="name"
              value={name}
              onChange={onChange}
              placeholder={t("Enter academic level name")}
              required={true}
              className="md:col-span-1"
            />
            
            <FormInput
              label={t("Code")}
              name="code"
              value={code}
              onChange={onChange}
              placeholder={t("Enter code (e.g., GRD-1)")}
              required={true}
              helperText={t("Will be converted to uppercase")}
              className="md:col-span-1"
            />
            
            <FormInput
              label={t("Order")}
              name="order"
              value={order}
              onChange={onChange}
              placeholder={t("Enter display order")}
              required={true}
              type="number"
              min="1"
              className="md:col-span-1"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <FormCheckbox
              label={t("Active Status")}
              name="status"
              checked={status}
              onChange={onChange}
              className="text-sm"
            />
            
            <FormActions
              onSubmit={submitHandler}
              onCancel={editMode ? resetForm : undefined}
              submitLabel={editMode ? t("Update Level") : t("Save Level")}
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

      {/* Stats Cards */}
      <StatsCards
        stats={stats}
        columns={4}
        className="mb-6"
      />

      {/* Data Table Container */}
      <DataTableContainer
        title={t("Academic Levels")}
        subtitle={t("View and manage your organization's academic structures")}
        data={data?.levels || []}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        
        // Pagination props
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        
        // Search props
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search by name or code...")}
        
        // Action props
        onRefresh={handleRefresh}
        refreshButton={<RefreshButton onClick={handleRefresh} disabled={isFetching} />}
        addButton={addButton}
        emptyState={emptyState}
        userRole={user?.role}
        
        // Row actions
        renderRowActions={renderRowActions}
        
        // Custom render props
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {editMode ? t("Edit mode active - Scroll up to see form") : t("Fill the form above to create new academic levels")}
          </p>
        )}
        
        // Custom styling
        showSearch={true}
        showStats={false} // We're showing stats separately
        showPagination={true}
        className="academic-levels-table"
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={deleteLoading}
        message={t("Are you sure you want to delete this academic level? This action cannot be undone.")}
        title={t("Delete Academic Level")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        confirmColor="red"
      />
    </AdminLayout>
  );
};

export default NewAcademicLevel;