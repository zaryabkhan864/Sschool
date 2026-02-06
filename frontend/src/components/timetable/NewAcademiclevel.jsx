import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { 
  useGetAcademicLevelsQuery, 
  useCreateAcademicLevelMutation, 
  useUpdateAcademicLevelMutation,
  useDeleteAcademicLevelMutation 
} from "../../redux/api/academicLevelApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import RefreshButton from "../layout/RefreshButton";

const NewAcademicLevel = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  // Form State (Year removed as per requirement)
  const [academicLevel, setAcademicLevel] = useState({
    name: "",
    code: "",
    order: "",
    campus: "",
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

  const { data: campusesData } = useGetCampusQuery({ paginate: "false" });

  const [createAcademicLevel, { isLoading: createLoading, isSuccess: createSuccess, error: createError }] = useCreateAcademicLevelMutation();
  const [updateAcademicLevel, { isLoading: updateLoading, isSuccess: updateSuccess, error: updateError }] = useUpdateAcademicLevelMutation();
  const [deleteAcademicLevel, { isLoading: deleteLoading, isSuccess: deleteSuccess, error: deleteError }] = useDeleteAcademicLevelMutation();

  const { name, code, order, campus, status } = academicLevel;

  useEffect(() => {
    if (createError || updateError || deleteError) {
      const err = createError || updateError || deleteError;
      toast.error(err?.data?.message || t("Something went wrong"));
    }
    if (createSuccess) {
      toast.success(t("Academic Level created successfully"));
      resetForm();
    }
    if (updateSuccess) {
      toast.success(t("Academic Level updated successfully"));
      resetForm();
    }
    if (deleteSuccess) {
      toast.success(t("Academic Level deleted successfully"));
      setShowModal(false);
      setSelectedLevelId(null);
    }
  }, [createError, updateError, deleteError, createSuccess, updateSuccess, deleteSuccess, t]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAcademicLevel({ 
      ...academicLevel, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const resetForm = () => {
    setAcademicLevel({ name: "", code: "", order: "", campus: "", status: true });
    setEditMode(false);
    setEditId(null);
  };

  const submitHandler = (e) => {
    e.preventDefault();
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
      campus: level.campus._id || level.campus,
      status: level.status,
    });
    setEditMode(true);
    setEditId(level._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    if (selectedLevelId) deleteAcademicLevel(selectedLevelId);
  };

  // DataTable Columns
  const columns = [
    {
      header: t("Name"),
      accessor: "name",
      render: (val) => <span className="font-medium text-gray-800">{val}</span>
    },
    {
      header: t("Code"),
      accessor: "code",
      render: (val) => <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{val}</span>
    },
    { header: t("Order"), accessor: "order" },
    { 
      header: t("Status"), 
      accessor: "status",
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val ? t("Active") : t("Inactive")}
        </span>
      )
    }
  ];

  const renderRowActions = (row) => (
    <div className="flex justify-end gap-2">
      <button onClick={() => handleEdit(row)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
        <i className="fa fa-edit text-sm"></i>
      </button>
      <button onClick={() => { setSelectedLevelId(row._id); setShowModal(true); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
        <i className="fa fa-trash text-sm"></i>
      </button>
    </div>
  );

  const stats = [
    { label: t("Total Levels"), value: data?.pagination?.total || 0, icon: "layer-group", color: "blue" },
    { label: t("Active"), value: data?.levels?.filter(l => l.status).length || 0, icon: "check-circle", color: "green" }
  ];

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Academic Level") : t("Create Academic Level")} />

      {/* Form Section - Integrated with Theme */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className={`fa ${editMode ? 'fa-edit' : 'fa-plus-circle'} text-blue-600`}></i>
          {editMode ? t("Edit Academic Level") : t("Create New Academic Level")}
        </h2>
        
        <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Name")} *</label>
            <input type="text" name="name" value={name} onChange={onChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Code")} *</label>
            <input type="text" name="code" value={code} onChange={onChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Order")} *</label>
            <input type="number" name="order" value={order} onChange={onChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("Campus")} *</label>
            <select name="campus" value={campus} onChange={onChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">{t("Select Campus")}</option>
              {campusesData?.campus?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="lg:col-span-4 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="status" name="status" checked={status} onChange={onChange} className="w-5 h-5 text-blue-600 rounded" />
              <label htmlFor="status" className="text-sm font-medium text-gray-700">{t("Active Status")}</label>
            </div>
            <div className="flex gap-3">
              {editMode && (
                <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  {t("Cancel")}
                </button>
              )}
              <button type="submit" disabled={createLoading || updateLoading} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-50">
                {createLoading || updateLoading ? <i className="fa fa-spinner fa-spin mr-2"></i> : null}
                {editMode ? t("Update Level") : t("Save Level")}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Data Table Container */}
      <DataTableContainer
        title={t("Academic Levels")}
        subtitle={t("View and manage your organization's academic structures")}
        data={data?.levels || []}
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
        searchPlaceholder={t("Search by name or code...")}
        onRefresh={() => refetch()}
        refreshButton={<RefreshButton onClick={() => refetch()} disabled={isFetching} />}
        stats={stats}
        renderRowActions={renderRowActions}
        showStats={true}
      />

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={deleteLoading}
        message={t("Are you sure you want to delete this level? This cannot be undone.")}
      />
    </AdminLayout>
  );
};

export default NewAcademicLevel;