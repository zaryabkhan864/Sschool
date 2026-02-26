import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// ===== API =====
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetClassGroupsForDropdownQuery } from "../../redux/api/classGroupApi";
import { useGetWeekDaysQuery } from "../../redux/api/weekDayApi";
import { useGetSessionTemplatesQuery } from "../../redux/api/sessionTemplateApi";
import {
  useGetAndCreateTimeTableQuery,
  useUpdateTimeTableSlotsMutation,
} from "../../redux/api/timeTableSlotApi";

// ===== LAYOUT & SHARED GUI COMPONENTS =====
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import TimetableGrid from "../GUI/TimetableGrid";
import SearchableDropdown from "../layout/SearchableDropdown";

const CreateTimeTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ academicLevel: "", classGroup: "" });
  const [grid, setGrid] = useState({});
  const isInitialLoadDone = useRef(false);
  const [fetchTrigger, setFetchTrigger] = useState(false);

  // ----- Academic Levels (saare records lao) -----
  // Agar aapke academicLevels API mein pagination ho to yahan paginate: false dena hoga
  const { data: academicLevelsData, isLoading: academicLevelsLoading } =
    useGetAcademicLevelsQuery({ paginate: false }); // { paginate: false } agar endpoint support karta ho

  // ----- Class Groups (academicLevel ke hisaab se filtered, saare records) -----
  const {
    data: classGroupsData,
    isLoading: classGroupsLoading,
    isFetching: classGroupsFetching,
  } = useGetClassGroupsForDropdownQuery(
    {
      academicLevel: form.academicLevel,
      status: "active", // sirf active groups dikhane hain (optional)
    },
    { skip: !form.academicLevel } // jab tak academicLevel select na ho, tab tak query nahi chalegi
  );

  // ----- Week Days & Session Templates -----
  const { data: weekDaysData } = useGetWeekDaysQuery();
  const { data: sessionTemplatesData } = useGetSessionTemplatesQuery({ dropdown: true });

  const academicLevels = academicLevelsData?.levels || [];
  const weekDays = weekDaysData?.days || [];
  const sessionTemplates = sessionTemplatesData?.sessions || sessionTemplatesData || [];

  const sortedWeekDays = useMemo(
    () => [...weekDays].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [weekDays]
  );

  const displaySessions = useMemo(() => {
    if (!form.academicLevel) return [];
    return sessionTemplates.filter(
      (t) =>
        !t.academicLevel ||
        t.academicLevel?._id === form.academicLevel ||
        t.academicLevel === form.academicLevel
    );
  }, [sessionTemplates, form.academicLevel]);

  // ----- Timetable Data (fetch ya create) -----
  const { data: timeTableData, isFetching: isFetchingSlots } = useGetAndCreateTimeTableQuery(
    form.classGroup,
    { skip: !form.classGroup || !fetchTrigger }
  );

  const [updateTimeTableSlots, { isLoading: isUpdating }] = useUpdateTimeTableSlotsMutation();

  // Jab timetable fetch ho jaye to grid populate karo
  useEffect(() => {
    if (
      !timeTableData?.timeTable?.slots ||
      !sortedWeekDays.length ||
      !displaySessions.length ||
      isInitialLoadDone.current
    )
      return;
    isInitialLoadDone.current = true;
    const newGrid = {};
    sortedWeekDays.forEach((day) => {
      newGrid[day._id] = {};
      displaySessions.forEach((session) => {
        newGrid[day._id][session._id] = { course: "", teacher: null, slotId: null };
      });
    });
    timeTableData.timeTable.slots.forEach((slot) => {
      const dayId = slot.weekDay?._id || slot.weekDay;
      const sessionId = slot.sessionTemplate?._id || slot.sessionTemplate;
      if (newGrid[dayId] && newGrid[dayId][sessionId]) {
        newGrid[dayId][sessionId] = {
          course: slot.course?._id || slot.course || "",
          teacher: slot.teacher?._id || slot.teacher,
          slotId: slot._id,
        };
      }
    });
    setGrid(newGrid);
  }, [timeTableData, sortedWeekDays, displaySessions]);

  // Jab classGroup change ho to grid reset karo
  useEffect(() => {
    setGrid({});
    isInitialLoadDone.current = false;
    setFetchTrigger(false);
  }, [form.classGroup]);

  const handleCourseChange = (dayId, sessionId, courseId, teacherId) => {
    setGrid((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [sessionId]: { ...prev[dayId]?.[sessionId], course: courseId || "", teacher: teacherId },
      },
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const slotsToUpdate = [];
    Object.keys(grid).forEach((dayId) => {
      Object.keys(grid[dayId]).forEach((sessionId) => {
        const cell = grid[dayId][sessionId];
        slotsToUpdate.push({
          weekDay: dayId,
          sessionTemplate: sessionId,
          course: cell.course || null,
          teacher: cell.teacher || null,
        });
      });
    });
    try {
      await updateTimeTableSlots({ classGroupId: form.classGroup, slots: slotsToUpdate }).unwrap();
      toast.success(t("Saved successfully"));
      navigate("/admin/timetables");
    } catch (err) {
      toast.error(err?.data?.message || t("Error saving"));
    }
  };

  const isEditMode = timeTableData?.timeTable?.slots?.some((slot) => slot.course);

  // Dropdown options
  const levelOptions = academicLevels.map((lvl) => ({
    value: lvl._id,
    label: lvl.name,
  }));

  // classGroupsData seedha array hai (kyonki dropdown query hai)
  const classGroupOptions = classGroupsData?.map((grp) => ({
    value: grp._id,
    label: grp.displayName || `${grp.grade?.gradeName} - ${grp.section}`,
  })) || [];

  return (
    <AdminLayout>
      <MetaData title={t("Timetable")} />

      <div className="max-w-7xl mx-auto py-6 animate-fade-in">
        <AppPageHeader
          title={isEditMode ? t("Edit Timetable") : t("Create Timetable")}
          subtitle={t("Configure class schedules and sessions")}
          backUrl="/admin/timetables"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Selection Card */}
          <AppCard
            title={t("Select Class")}
            icon="fa-calendar-alt"
            className="animate-slide-up"
          >
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-64">
                <SearchableDropdown
                  label={t("Academic Level")}
                  value={form.academicLevel}
                  onChange={(val) =>
                    setForm({ ...form, academicLevel: val, classGroup: "" })
                  }
                  options={levelOptions}
                  placeholder={t("Select Level")}
                  required
                  isLoading={academicLevelsLoading}
                  showSelected={true}
                />
              </div>

              <div className="w-64">
                <SearchableDropdown
                  label={t("Class Group")}
                  value={form.classGroup}
                  onChange={(val) => setForm({ ...form, classGroup: val })}
                  options={classGroupOptions}
                  placeholder={t("Select Group")}
                  required
                  disabled={!form.academicLevel}
                  isLoading={classGroupsLoading || classGroupsFetching}
                  showSelected={true}
                />
              </div>

              <AppButton
                type="button"
                onClick={() => setFetchTrigger(true)}
                disabled={!form.classGroup || isFetchingSlots}
                label={isFetchingSlots ? t("Fetching...") : t("Fetch Timetable")}
                icon={isFetchingSlots ? "fa-spinner fa-spin" : "fa-download"}
                isLoading={isFetchingSlots}
                className="mb-0.5"
              />
            </div>

            {/* Info box */}
            <div className="mt-4 p-4 bg-brand-50 text-brand-700 rounded-xl flex items-start gap-3 shadow-soft">
              <i className="fa fa-info-circle mt-0.5 text-brand-500"></i>
              <span className="text-sm-custom font-medium">
                {t(
                  "Select an academic level and class group, then click Fetch to load or create the timetable."
                )}
              </span>
            </div>
          </AppCard>

          {/* Timetable Grid Card */}
          {timeTableData && (
            <AppCard
              title={t("Timetable Slots")}
              icon="fa-table"
              className="animate-slide-up"
              footer={
                <div className="flex justify-end gap-3">
                  <AppButton backUrl="/admin/timetables" variant="outline" />
                  <AppButton
                    type="submit"
                    label={t("Save Timetable")}
                    loadingLabel={t("Saving...")}
                    isLoading={isUpdating}
                    icon="fa-save"
                  />
                </div>
              }
            >
              <TimetableGrid
                weekDays={sortedWeekDays}
                sessions={displaySessions}
                grid={grid}
                classGroupId={form.classGroup}
                onCourseChange={handleCourseChange}
              />
            </AppCard>
          )}
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateTimeTable;