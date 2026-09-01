import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  useGetDaySessionConfigsQuery,
  useCreateDaySessionConfigMutation,
  useUpdateDaySessionConfigMutation,
  useDeleteDaySessionConfigMutation,
} from "../../redux/api/daySessionConfigApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetWeekDaysQuery } from "../../redux/api/weekDayApi";
import { useGetSessionTemplatesQuery } from "../../redux/api/sessionTemplateApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import TableRowActions from "../GUI/TableRowActions";
import SearchableDropdown from "../layout/SearchableDropdown";
import EmptyState from "../GUI/EmptyState";

const CreateDaySessionTemplate = () => {
  const { t } = useTranslation();

  // ------------------ Form State ------------------
  const [formData, setFormData] = useState({
    academicLevel: "",
    weekDay: "",
    sessions: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // ------------------ Table / UI State ------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [filterAcademicLevel, setFilterAcademicLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ------------------ Reference Data ------------------
  const { data: academicLevelsData, isLoading: levelsLoading } =
    useGetAcademicLevelsQuery({ paginate: false });

  const { data: weekDaysData, isLoading: weekDaysLoading } =
    useGetWeekDaysQuery({ paginate: "false" });

  const { data: sessionTemplatesData } = useGetSessionTemplatesQuery({
    paginate: false,
  });

  const academicLevels = academicLevelsData?.levels || [];
  const weekDays = useMemo(
    () => [...(weekDaysData?.days || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [weekDaysData]
  );
  const sessionTemplates = sessionTemplatesData?.sessions || sessionTemplatesData || [];

  const academicLevelOptions = useMemo(
    () =>
      academicLevels.map((lvl) => ({
        value: lvl._id,
        label: `${lvl.name}${lvl.code ? ` (${lvl.code})` : ""}`,
      })),
    [academicLevels]
  );

  const weekDayOptions = useMemo(
    () => weekDays.map((d) => ({ value: d._id, label: d.name })),
    [weekDays]
  );

  const sessionsForLevel = useMemo(() => {
    if (!formData.academicLevel) return [];
    return sessionTemplates.filter(
      (s) =>
        !s.academicLevel ||
        s.academicLevel?._id === formData.academicLevel ||
        s.academicLevel === formData.academicLevel
    );
  }, [sessionTemplates, formData.academicLevel]);

  // ------------------ Configs Query ------------------
  const {
    data: configsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDaySessionConfigsQuery(
    {
      page: currentPage,
      limit,
      academicLevel: filterAcademicLevel || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createDaySessionConfig, { isLoading: isCreating }] =
    useCreateDaySessionConfigMutation();
  const [updateDaySessionConfig, { isLoading: isUpdating }] =
    useUpdateDaySessionConfigMutation();
  const [deleteDaySessionConfig, { isLoading: isDeleting }] =
    useDeleteDaySessionConfigMutation();

  const configs = configsData?.configs || [];
  const pagination = configsData?.pagination || null;

  useEffect(() => {
    if (isError) toast.error(t("Failed to load day session configs"));
  }, [isError, t]);

  // ------------------ Handlers ------------------
  const resetForm = () => {
    setFormData({ academicLevel: "", weekDay: "", sessions: [] });
    setEditMode(false);
    setEditId(null);
  };

  const toggleSession = (sessionId) => {
    setFormData((prev) => {
      const exists = prev.sessions.includes(sessionId);
      return {
        ...prev,
        sessions: exists
          ? prev.sessions.filter((id) => id !== sessionId)
          : [...prev.sessions, sessionId],
      };
    });
  };

  const handleEdit = (config) => {
    setEditMode(true);
    setEditId(config._id);
    setFormData({
      academicLevel: config.academicLevel?._id || config.academicLevel || "",
      weekDay: config.weekDay?._id || config.weekDay || "",
      sessions: (config.sessions || []).map((s) => s?._id || s),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (id) => {
    setSelectedConfigId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedConfigId) return;
    try {
      await deleteDaySessionConfig(selectedConfigId).unwrap();
      toast.success(t("Day session config deleted successfully"));
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || t("Failed to delete config"));
    } finally {
      setShowDeleteModal(false);
      setSelectedConfigId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.academicLevel) return toast.error(t("Academic level is required"));
    if (!formData.weekDay) return toast.error(t("Week day is required"));
    if (!formData.sessions.length) return toast.error(t("Select at least one session"));

    const payload = {
      academicLevel: formData.academicLevel,
      weekDay: formData.weekDay,
      sessions: formData.sessions,
    };

    try {
      if (editMode) {
        await updateDaySessionConfig({ id: editId, body: payload }).unwrap();
        toast.success(t("Day session config updated successfully"));
      } else {
        await createDaySessionConfig(payload).unwrap();
        toast.success(t("Day session config created successfully"));
      }
      refetch();
      resetForm();
    } catch (error) {
      toast.error(
        error?.data?.message || t(`Failed to ${editMode ? "update" : "create"} config`)
      );
    }
  };

  const resetFilters = () => {
    setFilterAcademicLevel("");
    setCurrentPage(1);
    setLimit(10);
    setShowFilters(false);
  };

  // ------------------ Table Columns ------------------
  const columns = [
    {
      header: t("Week Day"),
      accessor: "weekDay",
      width: "20%",
      render: (val) => (
        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">
          {val?.name || "N/A"}
        </span>
      ),
    },
    {
      header: t("Academic Level"),
      accessor: "academicLevel",
      width: "25%",
      render: (val) => (
        <span className="text-sm font-medium text-gray-700">{val?.name || "N/A"}</span>
      ),
    },
    {
      header: t("Sessions"),
      accessor: "sessions",
      width: "40%",
      render: (val) => (
        <div className="flex flex-wrap gap-1.5">
          {(val || []).length ? (
            val.map((s) => (
              <span
                key={s._id}
                className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              >
                {s.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">{t("No sessions")}</span>
          )}
        </div>
      ),
    },
    {
      header: t("Count"),
      accessor: "sessions",
      width: "15%",
      render: (val) => (
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">{(val || []).length}</span>
        </div>
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

  const stats = [
    {
      label: t("Total Configs"),
      value: pagination?.total || configs.length,
      icon: "calendar-day",
      color: "blue",
    },
    {
      label: t("Working Days Configured"),
      value: new Set(configs.map((c) => c.weekDay?._id)).size,
      icon: "check-circle",
      color: "green",
    },
    {
      label: t("Items Shown"),
      value: configs.length,
      icon: "list-ul",
      color: "purple",
    },
  ];

  const filters = (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 shadow-soft"
        type="button"
      >
        <i className="fa fa-sliders-h"></i>
        <span>{t("Filters")}</span>
        <i className={`fa fa-chevron-${showFilters ? "up" : "down"} text-sm`}></i>
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-premium z-20 p-5">
          <h3 className="font-medium text-gray-700 mb-3">{t("Filter Configs")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Items per page")}
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {[5, 8, 10, 15, 20, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} {t("items")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <SearchableDropdown
                label={t("Academic Level")}
                value={filterAcademicLevel}
                onChange={(val) => {
                  setFilterAcademicLevel(val);
                  setCurrentPage(1);
                }}
                options={academicLevelOptions}
                placeholder={t("All Levels")}
              />
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={resetFilters}
                type="button"
                className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center justify-center gap-2"
              >
                <i className="fa fa-undo"></i>
                {t("Reset Filters")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const emptyState = (
    <EmptyState
      icon="calendar-day"
      title={t("No day session configs created yet")}
      message={t(
        "Select an academic level, week day and sessions above to create your first config."
      )}
    />
  );

  if (levelsLoading || weekDaysLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={editMode ? t("Edit Day Session Config") : t("Create Day Session Config")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        {/* ---------- Form Card ---------- */}
        <AppCard
          title={editMode ? t("Edit Day Session Config") : t("Create Day Session Config")}
          icon={editMode ? "edit" : "plus-circle"}
          className="mb-8 animate-slide-up"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SearchableDropdown
                label={t("Academic Level")}
                value={formData.academicLevel}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, academicLevel: val, sessions: [] }))
                }
                options={academicLevelOptions}
                placeholder={t("Select Level")}
                required
                showSelected={true}
              />

              <SearchableDropdown
                label={t("Week Day")}
                value={formData.weekDay}
                onChange={(val) => setFormData((prev) => ({ ...prev, weekDay: val }))}
                options={weekDayOptions}
                placeholder={t("Select Day")}
                required
                showSelected={true}
              />
            </div>

            {/* Sessions multi-select */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("Sessions")}
              </label>

              {!formData.academicLevel ? (
                <div className="p-4 bg-gray-50 text-gray-500 text-sm-custom rounded-xl border border-gray-100">
                  {t("Select an academic level first to see available sessions.")}
                </div>
              ) : sessionsForLevel.length === 0 ? (
                <div className="p-4 bg-gray-50 text-gray-500 text-sm-custom rounded-xl border border-gray-100">
                  {t("No session templates found for this academic level.")}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sessionsForLevel.map((session) => {
                    const checked = formData.sessions.includes(session._id);
                    return (
                      <label
                        key={session._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors shadow-soft ${
                          checked
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSession(session._id)}
                          className="h-4 w-4 rounded text-brand-500 focus:ring-brand-500"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {session.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.startTime} - {session.endTime}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-end gap-2">
              {editMode && (
                <AppButton label={t("Cancel")} onClick={resetForm} icon="times" type="button" />
              )}
              <AppButton
                label={editMode ? t("Update Config") : t("Save Config")}
                loadingLabel={editMode ? t("Updating...") : t("Saving...")}
                isLoading={isCreating || isUpdating}
                icon={editMode ? "save" : "plus"}
                type="submit"
              />
            </div>
          </form>
        </AppCard>

        {/* ---------- Data Table ---------- */}
        <DataTableContainer
          title={t("Day Session Configs")}
          subtitle={t("Manage which sessions run on each week day, per academic level")}
          data={configs}
          columns={columns}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          onRefresh={refetch}
          refreshButton={
            <AppButton onClick={refetch} text={t("Refresh")} icon="sync-alt" disabled={isFetching} />
          }
          emptyState={emptyState}
          filters={filters}
          stats={stats}
          userRole="admin"
          renderRowActions={renderRowActions}
          className="day-session-config-table"
          showSearch={false}
          showStats={true}
          showPagination={true}
        />

        {/* ---------- Delete Confirmation Modal ---------- */}
        <ConfirmationModal
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          confirmDelete={confirmDelete}
          isDeleteLoading={isDeleting}
          message={t(
            "Are you sure you want to delete this day session config? This action cannot be undone."
          )}
          title={t("Delete Day Session Config")}
          confirmText={t("Delete")}
          cancelText={t("Cancel")}
          confirmColor="red"
        />
      </div>
    </AdminLayout>
  );
};

export default CreateDaySessionTemplate;
