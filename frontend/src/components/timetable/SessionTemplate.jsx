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
import RefreshButton from "../layout/RefreshButton";
import AdminLayout from "../GUI/AdminLayout";
import WarningBanner from "../../components/GUI/WarningBanner";
import InfoBanner from "../../components/GUI/InfoBanner";

import FormSection from "../../components/GUI/FormSection";
import FormInput from "../../components/GUI/FormInput";
import FormSelect from "../../components/GUI/FormSelect";
import FormActions from "../../components/GUI/FormActions";
import TableRowActions from "../../components/GUI/TableRowActions";
import StatsCards from "../../components/GUI/StatsCards";
import Modal from "../../components/GUI/Modal";

// ✅ Cookie helper
const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split('; ');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) return decodeURIComponent(cookieValue);
  }
  return null;
};

const SessionTemplate = () => {
  const { t } = useTranslation();

  // ✅ Cookies se campus aur year
  const [currentCampus, setCurrentCampus] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);

  // ✅ Form state – اب year aur campus موجود نہیں
  const [formData, setFormData] = useState({
    name: "",
    type: "CLASS",
    order: "",
    startTime: "",
    endTime: "",
    academicLevel: "",
  });

  // UI state – pagination کی تمام state ہٹا دی گئی
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [filterAcademicLevel, setFilterAcademicLevel] = useState("");

  // ✅ Cookies load
  useEffect(() => {
    const campus = getCookie('campus');
    const year = getCookie('selectedYear');
    setCurrentCampus(campus);
    setCurrentYear(year ? parseInt(year) : new Date().getFullYear());
  }, []);

  // ✅ Academic levels (campus ke hisaab se)
  const {
    data: academicLevelsData,
    isLoading: levelsLoading,
  } = useGetAcademicLevelsQuery({
    paginate: false,
    campus: currentCampus,
  }, {
    skip: !currentCampus,
    refetchOnMountOrArgChange: true,
  });

  // ✅ Session templates – اب pagination کے بغیر (limit = 1000 تاکہ تمام ریکارڈز آ جائیں)
  const {
    data: sessionTemplatesData,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useGetSessionTemplatesQuery({
    limit: 1000,                 // بہت بڑی limit – تمام ڈیٹا ایک بار میں
    year: currentYear,
    campus: currentCampus,
    academicLevel: filterAcademicLevel || undefined,
  }, {
    skip: !currentCampus || !currentYear,
    refetchOnMountOrArgChange: true,
  });

  const [createSessionTemplate, { isLoading: isCreating }] = useCreateSessionTemplateMutation();
  const [updateSessionTemplate, { isLoading: isUpdating }] = useUpdateSessionTemplateMutation();
  const [deleteSessionTemplate, { isLoading: isDeleting }] = useDeleteSessionTemplateMutation();

  // ✅ Academic level options (filter dropdown ke liye)
  const academicLevelOptions = useMemo(() => {
    if (!academicLevelsData?.levels) return [];
    return academicLevelsData.levels.map(l => ({
      value: l._id,
      label: `${l.name} (${l.code || ''})`
    }));
  }, [academicLevelsData]);

  // ✅ Academic level name (table display ke liye)
  const getAcademicLevelName = (levelId) => {
    if (!levelId) return t("Not Set");
    const level = academicLevelsData?.levels?.find(l => l._id === (levelId._id || levelId));
    return level ? `${level.name} (${level.code || ''})` : levelId;
  };

  // Sessions array extract – اب pagination آبجیکٹ کی ضرورت نہیں
  const getSessionsArray = () => {
    if (!sessionTemplatesData) return [];
    if (Array.isArray(sessionTemplatesData)) return sessionTemplatesData;
    if (sessionTemplatesData.sessions && Array.isArray(sessionTemplatesData.sessions)) return sessionTemplatesData.sessions;
    if (sessionTemplatesData.data && Array.isArray(sessionTemplatesData.data)) return sessionTemplatesData.data;
    return [];
  };

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

  // ✅ Submit handler – payload mein year NAHI bhej rahe
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error(t("Session name is required"));
    if (!formData.order || formData.order < 1) return toast.error(t("Valid order number is required"));
    if (!formData.startTime || !formData.endTime) return toast.error(t("Start and end times are required"));
    if (!formData.academicLevel) return toast.error(t("Academic level is required"));
    if (!currentCampus || !currentYear) return toast.error(t("Campus/Year not selected in header"));

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
      toast.error(error?.data?.message || t(`Failed to ${editMode ? 'update' : 'create'} session template`));
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
      case "CLASS": return "bg-blue-100 text-blue-800";
      case "BREAK": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      return `${duration} mins`;
    } catch {
      return "N/A";
    }
  };

  // ✅ نئے کالمز – Campus ہٹایا، ترتیب بدلی (Session Name پہلے)
  const columns = [
    {
      header: t("Session Name"),
      accessor: "name",
      width: "25%",
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-800">{value}</h4>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getTypeBadge(row.type)}`}>
              {row.type}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Year: {row.year}</p>
        </div>
      )
    },
    {
      header: t("Order"),
      accessor: "order",
      width: "10%",
      render: (val) => (
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">{val}</span>
        </div>
      )
    },
    {
      header: t("Time"),
      accessor: "startTime",
      width: "25%",
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-2">
            <i className="fa fa-clock text-xs text-gray-400"></i>
            <span className="text-sm font-medium text-gray-700">
              {formatTime(value)} - {formatTime(row.endTime)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Duration: {calculateDuration(value, row.endTime)}
          </p>
        </div>
      )
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "25%",
      render: (val) => (
        <p className="text-sm text-gray-700">
          {getAcademicLevelName(val?._id || val)}
        </p>
      )
    }
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

  const sessionsArray = getSessionsArray();

  // ✅ Stats – اب "Total Pages" ہٹا دیا گیا
  const stats = [
    { label: t("Total Sessions"), value: sessionsArray.length || 0, icon: "clock", color: "blue" },
    { label: t("Class Sessions"), value: sessionsArray.filter(s => s.type === 'CLASS').length || 0, icon: "chalkboard-teacher", color: "green" },
    { label: t("Break Sessions"), value: sessionsArray.filter(s => s.type === 'BREAK').length || 0, icon: "coffee", color: "orange" },
  ];

  // ✅ صرف Academic Level کا فلٹر – Year والا فلٹر مکمل ہٹایا
  const filters = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormSelect
        label={t("Academic Level")}
        value={filterAcademicLevel}
        onChange={(e) => setFilterAcademicLevel(e.target.value)}
        options={[
          { value: "", label: t("All Levels") },
          ...academicLevelOptions
        ]}
      />
      <div className="flex items-end">
        <button
          onClick={() => {
            setFilterAcademicLevel("");
          }}
          className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2"
        >
          <i className="fa fa-refresh"></i>
          {t("Reset Filters")}
        </button>
      </div>
    </div>
  );

  const addButton = (
    <button
      onClick={handleCreateNew}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md flex items-center gap-2"
    >
      <i className="fa fa-plus"></i>
      {t("New Session Template")}
    </button>
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i className="fa fa-clock text-gray-400 text-2xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {t("No session templates created yet")}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {t("Get started by creating your first session template using the button above.")}
      </p>
    </div>
  );

  // Agar cookies na hon to warning
  if (!currentCampus || !currentYear) {
    return (
      <AdminLayout>
        <MetaData title={t("Session Templates")} />
        <div className="max-w-6xl mx-auto py-4 px-4">
          <WarningBanner
            title={t("Campus or Year not selected")}
            message={t("Please select campus and year from the header first.")}
            type="warning"
          />
        </div>
      </AdminLayout>
    );
  }

  if (isLoading || levelsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Session Templates")} />
      
      <div className="mb-6">
        <InfoBanner
          title={t("Current Session")}
          message={`Year: ${currentYear} | Campus: ${currentCampus}`}
          type="info"
          icon="calendar-alt"
        />
      </div>

      <StatsCards stats={stats} columns={3} className="mb-6" />

      <DataTableContainer
        title={t("Session Templates")}
        subtitle={t("Manage class and break schedules for different academic levels")}
        data={sessionsArray}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        // ❌ pagination, currentPage, setCurrentPage, limit, setLimit – سب ہٹا دیے
        onRefresh={refetch}
        refreshButton={<RefreshButton onClick={refetch} disabled={isFetching} />}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        userRole="admin"
        renderRowActions={renderRowActions}
        renderHeaderInfo={() => (
          <p className="text-sm text-gray-500 mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Session templates define the timing for classes and breaks")}
          </p>
        )}
        showSearch={false}
        showStats={false}
        showPagination={false}     // ✅ Pagination UI مکمل بند
        className="session-templates-table"
      />

      {/* Modal – ویسا ہی ہے */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editMode ? t("Edit Session Template") : t("New Session Template")}
        icon="clock"
        iconColor="blue"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <FormSection title={t("Session Details")} icon="info-circle" iconColor="blue" border={false} padding="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label={t("Session Name")}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("e.g., 1st Period, Lunch Break")}
                  required
                />
                <FormSelect
                  label={t("Session Type")}
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  options={[
                    { value: "CLASS", label: "Class Session" },
                    { value: "BREAK", label: "Break Time" }
                  ]}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormInput
                  label={t("Order Number")}
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  type="number"
                  min="1"
                  max="100"
                  placeholder={t("e.g., 1, 2, 3")}
                  required
                  helperText={t("Determines sequence in schedule")}
                />
              </div>
            </FormSection>

            <FormSection title={t("Time Settings")} icon="clock" iconColor="green" border={false} padding="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label={t("Start Time")}
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  type="time"
                  required
                />
                <FormInput
                  label={t("End Time")}
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  type="time"
                  required
                />
              </div>
            </FormSection>

            <FormSection title={t("Academic Level")} icon="graduation-cap" iconColor="purple" border={false} padding="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label={t("Academic Level")}
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleInputChange}
                  options={[
                    { value: "", label: t("Select Academic Level") },
                    ...academicLevelOptions
                  ]}
                  required
                />
              </div>
            </FormSection>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <FormActions
              onSubmit={handleSubmit}
              onCancel={() => { setShowModal(false); resetForm(); }}
              submitLabel={editMode ? t("Update Template") : t("Create Template")}
              cancelLabel={t("Cancel")}
              isLoading={isCreating || isUpdating}
              submitIcon={editMode ? "save" : "plus"}
              cancelIcon="times"
              submitColor="blue"
              cancelColor="gray"
              align="right"
            />
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleting}
        message={t("Are you sure you want to delete this session template? This action cannot be undone.")}
        title={t("Delete Session Template")}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        confirmColor="red"
      />
    </AdminLayout>
  );
};

export default SessionTemplate;