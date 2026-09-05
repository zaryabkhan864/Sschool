import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// ===== API =====
import { useGetClassGroupsQuery } from "../../redux/api/authApi";
import { useGetClassGroupDetailsQuery } from "../../redux/api/classGroupApi";
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
import Loader from "../layout/Loader";
import TimetableGrid from "../GUI/TimetableGrid";

// User has no single `name` field — only firstName/middleName/lastName.
const fullName = (user) =>
  [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(" ") || "-";

const CreateTimeTable = () => {
  const { t } = useTranslation();

  const [selectedClassGroup, setSelectedClassGroup] = useState(null); // full object
  const [grid, setGrid] = useState({});
  const isInitialLoadDone = useRef(false);
  const [fetchTrigger, setFetchTrigger] = useState(false);

  // ----- Class list (bottom-left panel) -----
  const { data: classGroupsData, isLoading: classGroupsLoading } = useGetClassGroupsQuery();

  const classGroups = useMemo(
    () => (classGroupsData || []).filter((cg) => cg.status !== false),
    [classGroupsData]
  );

  // ----- Class group details (bottom-right: courses + teachers) -----
  const {
    data: classGroupDetails,
    isFetching: isClassGroupDetailsFetching,
  } = useGetClassGroupDetailsQuery(selectedClassGroup?._id, {
    skip: !selectedClassGroup?._id,
  });

  const assignedCourses = classGroupDetails?.courses || [];

  // ----- Week Days & Session Templates -----
  const {
    data: weekDaysData,
    isError: isWeekDaysError,
    error: weekDaysError,
  } = useGetWeekDaysQuery({ paginate: "false" });

  const {
    data: sessionTemplatesData,
    isError: isSessionsError,
    error: sessionsError,
  } = useGetSessionTemplatesQuery({ page: 1, limit: 500 });

  const weekDays = weekDaysData?.days || [];
  const sessionTemplates = sessionTemplatesData?.sessions || sessionTemplatesData || [];

  const sortedWeekDays = useMemo(
    () => [...weekDays].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [weekDays]
  );

  const displaySessions = useMemo(() => {
    if (!selectedClassGroup) return [];
    const levelId = selectedClassGroup.academicLevel?._id || selectedClassGroup.academicLevel;
    return sessionTemplates
      .filter((s) => !s.academicLevel || s.academicLevel?._id === levelId || s.academicLevel === levelId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [sessionTemplates, selectedClassGroup]);

  // ----- Timetable Data (fetch or create) -----
  const {
    data: timeTableData,
    isFetching: isFetchingSlots,
    isError: isTimeTableError,
    error: timeTableError,
  } = useGetAndCreateTimeTableQuery(selectedClassGroup?._id, {
    skip: !selectedClassGroup?._id || !fetchTrigger,
  });

  const [updateTimeTableSlots, { isLoading: isUpdating }] = useUpdateTimeTableSlotsMutation();

  useEffect(() => {
    if (isTimeTableError) {
      toast.error(timeTableError?.data?.message || t("Failed to load timetable"));
    }
  }, [isTimeTableError, timeTableError, t]);

  useEffect(() => {
    if (isWeekDaysError) {
      toast.error(weekDaysError?.data?.message || t("Failed to load week days"));
    }
  }, [isWeekDaysError, weekDaysError, t]);

  useEffect(() => {
    if (isSessionsError) {
      toast.error(sessionsError?.data?.message || t("Failed to load session templates"));
    }
  }, [isSessionsError, sessionsError, t]);

  // Populate grid once timetable data, week days and sessions are all ready.
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
        newGrid[day._id][session._id] = { course: "", slotId: null };
      });
    });
    timeTableData.timeTable.slots.forEach((slot) => {
      const dayId = slot.weekDay?._id || slot.weekDay;
      const sessionId = slot.sessionTemplate?._id || slot.sessionTemplate;
      if (newGrid[dayId] && newGrid[dayId][sessionId]) {
        newGrid[dayId][sessionId] = {
          course: slot.course?._id || slot.course || "",
          slotId: slot._id,
        };
      }
    });
    setGrid(newGrid);
  }, [timeTableData, sortedWeekDays, displaySessions]);

  // Selecting a class from the list loads its timetable immediately.
  const handleSelectClass = (cg) => {
    if (selectedClassGroup?._id === cg._id) return;
    setSelectedClassGroup(cg);
    setGrid({});
    isInitialLoadDone.current = false;
    setFetchTrigger(true);
  };

  const handleCourseChange = (dayId, sessionId, courseId) => {
    setGrid((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [sessionId]: { ...prev[dayId]?.[sessionId], course: courseId || "" },
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
        });
      });
    });
    try {
      await updateTimeTableSlots({
        classGroupId: selectedClassGroup._id,
        slots: slotsToUpdate,
      }).unwrap();
      toast.success(t("Saved successfully"));
    } catch (err) {
      toast.error(err?.data?.message || t("Error saving"));
    }
  };

  const gridBlockedReason = !sortedWeekDays.length
    ? t("No week days are configured for this campus yet. Add week days first.")
    : !displaySessions.length
    ? t("No session templates found for this academic level. Create session templates first.")
    : null;

  return (
    <AdminLayout>
      <MetaData title={t("Timetable")} />

      <div className="max-w-7xl mx-auto py-6 animate-fade-in space-y-6">
        <AppPageHeader
          title={t("Class Timetables")}
          subtitle={t("Select a class below to view or edit its weekly schedule")}
          backUrl="/admin/timetables"
        />

        {/* ---------- Top: Timetable grid for the selected class ---------- */}
        {!selectedClassGroup ? (
          <AppCard title={t("Timetable")} icon="fa-table" className="animate-slide-up">
            <div className="p-6 text-center text-gray-500 text-sm-custom">
              {t("Select a class from the list below to view its timetable.")}
            </div>
          </AppCard>
        ) : !timeTableData ? (
          <AppCard title={selectedClassGroup.displayName} icon="fa-table" className="animate-slide-up">
            <Loader />
          </AppCard>
        ) : (
          <form onSubmit={submitHandler}>
            <AppCard
              title={t("Timetable")}
              subtitle={selectedClassGroup.displayName}
              icon="fa-table"
              className="animate-slide-up"
              footer={
                !gridBlockedReason && (
                  <div className="flex justify-end">
                    <AppButton
                      type="submit"
                      label={t("Save Timetable")}
                      loadingLabel={t("Saving...")}
                      isLoading={isUpdating}
                      icon="fa-save"
                    />
                  </div>
                )
              }
            >
              {gridBlockedReason ? (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl flex items-start gap-3 shadow-soft">
                  <i className="fa fa-exclamation-triangle mt-0.5"></i>
                  <span className="text-sm-custom font-medium">{gridBlockedReason}</span>
                </div>
              ) : (
                <TimetableGrid
                  weekDays={sortedWeekDays}
                  sessions={displaySessions}
                  grid={grid}
                  classGroupId={selectedClassGroup._id}
                  onCourseChange={handleCourseChange}
                />
              )}
            </AppCard>
          </form>
        )}

        {/* ---------- Bottom: Class list (left) + Courses & Teachers (right) ---------- */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Class list */}
          <div className="lg:w-72 flex-shrink-0">
            <AppCard title={t("Classes")} icon="fa-users" className="animate-slide-up">
              {classGroupsLoading ? (
                <Loader />
              ) : classGroups.length === 0 ? (
                <p className="text-sm text-gray-500">{t("No classes found.")}</p>
              ) : (
                <div className="max-h-[420px] overflow-y-auto divide-y">
                  {classGroups.map((cg) => (
                    <button
                      key={cg._id}
                      type="button"
                      onClick={() => handleSelectClass(cg)}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors ${
                        selectedClassGroup?._id === cg._id
                          ? "bg-brand-50 text-brand-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {cg.displayName || `${cg.grade?.gradeName || ""} ${cg.section || ""}`}
                      </span>
                      {selectedClassGroup?._id === cg._id && (
                        <i className="fa fa-chevron-right text-xs text-brand-500"></i>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </AppCard>
          </div>

          {/* Right: Courses & Teachers for the selected class */}
          <div className="flex-1 min-w-0">
            <AppCard
              title={t("Courses & Teachers")}
              subtitle={selectedClassGroup?.displayName || t("Select a class to see its courses")}
              icon="fa-chalkboard-teacher"
              className="animate-slide-up"
            >
              {!selectedClassGroup ? (
                <p className="text-sm text-gray-500 p-2">
                  {t("Select a class from the list to see its assigned courses and teachers.")}
                </p>
              ) : isClassGroupDetailsFetching ? (
                <Loader />
              ) : assignedCourses.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">
                  {t("No courses have been assigned to this class yet.")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("Course")}
                        </th>
                        <th className="p-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("Code")}
                        </th>
                        <th className="p-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("Teacher")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {assignedCourses.map((course) => (
                        <tr key={course._id}>
                          <td className="p-2 text-sm font-semibold text-gray-800">
                            {course.courseName}
                          </td>
                          <td className="p-2 text-xs text-gray-500">{course.code || "-"}</td>
                          <td className="p-2 text-sm text-gray-700">
                            {course.teacher ? fullName(course.teacher) : (
                              <span className="text-gray-400 italic">{t("Unassigned")}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AppCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateTimeTable;
