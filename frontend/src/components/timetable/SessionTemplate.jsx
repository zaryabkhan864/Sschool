import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  useGetSessionTemplatesQuery,
  useCreateSessionTemplateMutation,
  useUpdateSessionTemplateMutation,
  useDeleteSessionTemplateMutation,
} from "../../redux/api/sessionTemplateApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import AdminLayout from "../layout/AdminLayout";
import StatsCards from "../GUI/StatsCards";
import TableRowActions from "../GUI/TableRowActions";

import SessionFilters from "../GUI/SessionFilters";
import SessionFormModal from "../GUI/SessionFormModal";

const SessionTemplate = () => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "CLASS",
    order: "",
    startTime: "",
    endTime: "",
    academicLevel: "",
  });

  // UI state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Filter & pagination state
  const [filterAcademicLevel, setFilterAcademicLevel] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // you can adjust default page size

  // Academic levels
  const {
    data: academicLevelsData,
    isLoading: levelsLoading,
  } = useGetAcademicLevelsQuery(
    { paginate: false },
    { refetchOnMountOrArgChange: true }
  );

  // Session templates query with pagination and filters
  const {
    data: sessionTemplatesData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSessionTemplatesQuery(
    {
      page,
      limit,
      keyword: keyword || undefined,
      academicLevel: filterAcademicLevel || undefined,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [createSessionTemplate, { isLoading: isCreating }] =
    useCreateSessionTemplateMutation();
  const [updateSessionTemplate, { isLoading: isUpdating }] =
    useUpdateSessionTemplateMutation();
  const [deleteSessionTemplate, { isLoading: isDeleting }] =
    useDeleteSessionTemplateMutation();

  // Academic level options
  const academicLevelOptions = useMemo(() => {
    if (!academicLevelsData?.levels) return [];
    return academicLevelsData.levels.map((l) => ({
      value: l._id,
      label: `${l.name} (${l.code || ""})`,
    }));
  }, [academicLevelsData]);

  const getAcademicLevelName = (levelId) => {
    if (!levelId) return t("Not Set");
    const level = academicLevelsData?.levels?.find(
      (l) => l._id === (levelId._id || levelId)
    );
    return level ? `${level.name} (${level.code || ""})` : levelId;
  };

  // Extract sessions and pagination from API response
  const sessionsArray = sessionTemplatesData?.sessions || [];
  const pagination = sessionTemplatesData?.pagination || null;
  const totalSessions = sessionTemplatesData?.count || sessionsArray.length;

  // Error handling
  useEffect(() => {
    if (isError) toast.error(t("Failed to load session templates"));
  }, [isError, t]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "order") {
      const intValue = parseInt(value);
      if (value === "" || (intValue > 0 && intValue <= 100)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "CLASS",
      order: "",
      startTime: "",
      endTime: "",
      academicLevel: "",
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (session) => {
    setEditMode(true);
    setEditId(session._id);
    setFormData({
      name: session.name,
      type: session.type,
      order: session.order,
      startTime: session.startTime,
      endTime: session.endTime,
      academicLevel: session.academicLevel?._id || session.academicLevel || "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedSessionId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSessionId) return;
    try {
      await deleteSessionTemplate(selectedSessionId).unwrap();
      toast.success(t("Session template deleted successfully"));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || t("Failed to delete session template"));
    } finally {
      setShowDeleteModal(false);
      setSelectedSessionId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error(t("Session name is required"));
    if (!formData.order || formData.order < 1) return toast.error(t("Valid order number is required"));
    if (!formData.startTime || !formData.endTime) return toast.error(t("Start and end times are required"));
    if (!formData.academicLevel) return toast.error(t("Academic level is required"));

    const payload = {
      name: formData.name,
      type: formData.type,
      order: parseInt(formData.order),
      startTime: formData.startTime,
      endTime: formData.endTime,
      academicLevel: formData.academicLevel,
    };

    try {
      if (editMode) {
        await updateSessionTemplate({ id: editId, body: payload }).unwrap();
        toast.success(t("Session template updated successfully"));
      } else {
        await createSessionTemplate(payload).unwrap();
        toast.success(t("Session template created successfully"));
      }
      setShowModal(false);
      refetch();
      resetForm();
    } catch (error) {
      toast.error(error?.data?.message || t(`Failed to ${editMode ? "update" : "create"} session template`));
    }
  };

  // Helper functions
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "CLASS":
        return "bg-brand-50 text-brand-700";
      case "BREAK":
        return "bg-surface-100 text-ink-700";
      default:
        return "bg-surface-100 text-ink-700";
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const duration = endHour * 60 + endMin - (startHour * 60 + startMin);
      return `${duration} mins`;
    } catch {
      return "N/A";
    }
  };

  // Column definitions
  const columns = [
    {
      header: t("Session Name"),
      accessor: "name",
      width: "25%",
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm-custom font-semibold text-ink-900">{value}</h4>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getTypeBadge(row.type)}`}>
              {row.type}
            </span>
          </div>
          <p className="text-xs-custom text-ink-400 mt-0.5">Year: {row.year}</p>
        </div>
      ),
    },
    {
      header: t("Order"),
      accessor: "order",
      width: "10%",
      render: (val) => (
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
          <span className="text-xs-custom font-bold text-brand-600">{val}</span>
        </div>
      ),
    },
    {
      header: t("Time"),
      accessor: "startTime",
      width: "25%",
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2">
            <i className="fa fa-clock text-xs-custom text-ink-400"></i>
            <span className="text-sm-custom font-medium text-ink-700">
              {formatTime(value)} - {formatTime(row.endTime)}
            </span>
          </div>
          <p className="text-xs-custom text-ink-400 mt-0.5">
            Duration: {calculateDuration(value, row.endTime)}
          </p>
        </div>
      ),
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "25%",
      render: (val) => (
        <p className="text-sm-custom text-ink-700">{getAcademicLevelName(val?._id || val)}</p>
      ),
    },
  ];

  const renderRowActions = (row) => (
    <TableRowActions
      itemId={row._id}
      onEdit={() => handleEdit(row)}
      onDelete={() => handleDeleteClick(row._id)}
      isDeleteLoading={isDeleting}
      userRole="admin"
      requiredRole="admin"
      showView={false}
      showEdit={true}
      showDelete={true}
    />
  );

  // Stats (use totalSessions for accurate counts)
  const classCount = useMemo(() => {
    // if you want count from current page only, use sessionsArray.
    // For overall total, you might need separate API or count from server.
    // Here we show total sessions and count from current page for type.
    return sessionsArray.filter((s) => s.type === "CLASS").length;
  }, [sessionsArray]);

  const breakCount = sessionsArray.filter((s) => s.type === "BREAK").length;

  const stats = [
    { label: t("Total Sessions"), value: totalSessions || 0, icon: "clock", color: "blue" },
    { label: t("Class Sessions"), value: classCount, icon: "chalkboard-teacher", color: "green" },
    { label: t("Break Sessions"), value: breakCount, icon: "coffee", color: "orange" },
  ];

  // Filters component
  // 👇 FIX: SessionFilters expects `onAcademicLevelChange` / `onKeywordChange`
  // / `onReset`, but this was passing `setFilterAcademicLevel` / `setKeyword`
  // and no reset handler at all. Prop-name mismatch meant SearchableDropdown
  // received `onChange={undefined}` inside SessionFilters, so selecting an
  // academic level crashed with "onChange is not a function". Reset would
  // have crashed the same way once clicked.
  const filters = (
    <SessionFilters
      filterAcademicLevel={filterAcademicLevel}
      onAcademicLevelChange={(val) => {
        setFilterAcademicLevel(val);
        setPage(1);
      }}
      academicLevelOptions={academicLevelOptions}
      keyword={keyword}
      onKeywordChange={(val) => {
        setKeyword(val);
        setPage(1);
      }}
      onReset={() => {
        setFilterAcademicLevel("");
        setKeyword("");
        setPage(1);
      }}
    />
  );

  const addButton = (
    <AppButton
      label="New Session Template"
      icon="plus"
      variant="primary"
      onClick={handleCreateNew}
      type="button"
    />
  );

  const refreshButton = (
    <AppButton
      icon="refresh"
      variant="secondary"
      onClick={refetch}
      disabled={isFetching}
      type="button"
    />
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-clock text-ink-400 text-2xl"></i>
      </div>
      <h3 className="text-lg-custom font-medium text-ink-700 mb-2">
        {t("No session templates created yet")}
      </h3>
      <p className="text-sm-custom text-ink-400 text-center max-w-md">
        {t("Get started by creating your first session template using the button above.")}
      </p>
    </div>
  );

  if (isLoading || levelsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Session Templates")} />

      <StatsCards stats={stats} columns={3} className="mb-6" />

      <DataTableContainer
        title={t("Session Templates")}
        subtitle={t("Manage class and break schedules for different academic levels")}
        data={sessionsArray}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        onRefresh={refetch}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        userRole="admin"
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm-custom text-ink-400 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Session templates define the timing for classes and breaks")}
          </p>
        )}
        showSearch={true} // Enable search (keyword input)
        search={keyword}
        setSearch={(val) => {
          setKeyword(val);
          setPage(1); // reset to first page on search
        }}
        searchTerm={keyword}
        setSearchTerm={setKeyword}
        showStats={false}
        showPagination={true} // Enable pagination
        pagination={pagination}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        className="session-templates-table"
      />

      {/* Form Modal */}
      <SessionFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        editMode={editMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        academicLevelOptions={academicLevelOptions}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleting}
        message={t(
          "Are you sure you want to delete this session template? This action cannot be undone."
        )}
        title={t("Delete Session Template")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        confirmColor="red"
      />
    </AdminLayout>
  );
};

export default SessionTemplate;