import React, { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

// ===== TIMETABLE APIS =====
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetClassGroupsQuery } from "../../redux/api/classGroupApi";
import { useGetWeekDaysQuery } from "../../redux/api/weekDayApi";
import { useGetSessionTemplatesQuery } from "../../redux/api/sessionTemplateApi";
import {
  useGetAndCreateTimeTableQuery,
  useUpdateTimeTableSlotsMutation,
  useGetAvailableCoursesForSlotQuery,
} from "../../redux/api/timeTableSlotApi";

// ===== UI COMPONENTS =====
import AdminLayout from "../GUI/AdminLayout";
import SearchableDropdown from "../layout/SearchableDropdown";

// ========== SLOT CELL COMPONENT ==========
const SlotCell = ({
  dayId,
  sessionId,
  classGroupId,
  selectedCourseId,
  slotId,
  onCourseChange,
}) => {
  const { t } = useTranslation();

  const { data, isLoading, isFetching } = useGetAvailableCoursesForSlotQuery(
    {
      classGroup: classGroupId,
      weekDay: dayId,
      sessionTemplate: sessionId,
      slotId: slotId,
    },
    { skip: !classGroupId || !dayId || !sessionId }
  );

  const courseOptions = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses.map((item) => {
      let teacherDisplay = "";
      if (item.teacher) {
        teacherDisplay = item.teacher.name;
      } else {
        teacherDisplay = item.available ? t("No teacher assigned") : t("Teacher busy");
      }

      return {
        value: item.course._id,
        label: item.course.courseName,
        subtitle: item.course.code || "",
        teacherId: item.teacher?._id || null,
        teacherName: teacherDisplay,
        disabled: !item.available,
      };
    });
  }, [data, t]);

  const handleSelect = (courseId) => {
    const selected = courseOptions.find((opt) => opt.value === courseId);
    if (selected?.disabled) {
      toast.error(t("This course's teacher is busy in another class at this time"));
      return;
    }
    onCourseChange(dayId, sessionId, courseId, selected?.teacherId || null);
  };

  const selectedTeacher = useMemo(() => {
    const selected = courseOptions.find((opt) => opt.value === selectedCourseId);
    return selected?.teacherName || "";
  }, [selectedCourseId, courseOptions]);

  return (
    <div className="space-y-1.5 min-w-[180px]">
      <SearchableDropdown
        key={selectedCourseId || "empty"}
        label=""
        value={selectedCourseId || ""}
        onChange={handleSelect}
        options={courseOptions}
        isLoading={isLoading || isFetching}
        placeholder={t("Select...")}
        searchable={true}
        clearable={true}
        renderOption={(option) => (
          <div className={`flex items-center gap-2 py-0.5 ${option.disabled ? "opacity-50" : ""}`}>
            <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white ${option.disabled ? "bg-gray-400" : "bg-green-600"}`}>
              {option.label?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-semibold text-gray-700 truncate leading-none">{option.label}</p>
              <p className="text-[9px] text-gray-400 truncate mt-0.5">
                 {option.teacherName}
              </p>
            </div>
          </div>
        )}
      />

      {selectedCourseId && (
        <div className="flex items-center gap-1.5 bg-blue-50/50 px-2 py-1 rounded border border-blue-100">
          <i className="fa fa-user text-blue-500 text-[9px]"></i>
          <span className="text-[10px] text-blue-700 font-medium truncate">
            {selectedTeacher || t("No teacher")}
          </span>
        </div>
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const CreateTimeTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ academicLevel: "", classGroup: "" });
  const [grid, setGrid] = useState({});
  const isInitialLoadDone = useRef(false);
  const [fetchTrigger, setFetchTrigger] = useState(false);

  const { data: academicLevelsData } = useGetAcademicLevelsQuery();
  const { data: classGroupsData } = useGetClassGroupsQuery(
    { academicLevel: form.academicLevel },
    { skip: !form.academicLevel }
  );
  const { data: weekDaysData } = useGetWeekDaysQuery();
  const { data: sessionTemplatesData } = useGetSessionTemplatesQuery({ dropdown: true });

  const academicLevels = academicLevelsData?.levels || [];
  const weekDays = weekDaysData?.days || [];
  const sessionTemplates = sessionTemplatesData?.sessions || sessionTemplatesData || [];

  const sortedWeekDays = useMemo(() => 
    [...weekDays].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  , [weekDays]);

  const displaySessions = useMemo(() => {
    if (!form.academicLevel) return [];
    return sessionTemplates.filter(t => 
      !t.academicLevel || t.academicLevel?._id === form.academicLevel || t.academicLevel === form.academicLevel
    );
  }, [sessionTemplates, form.academicLevel]);

  const { data: timeTableData, isLoading: isLoadingSlots, isFetching: isFetchingSlots } = 
    useGetAndCreateTimeTableQuery(form.classGroup, { skip: !form.classGroup || !fetchTrigger });

  const [updateTimeTableSlots, { isLoading: isUpdating }] = useUpdateTimeTableSlotsMutation();

  useEffect(() => {
    if (!timeTableData?.timeTable?.slots || !sortedWeekDays.length || !displaySessions.length || isInitialLoadDone.current) return;
    isInitialLoadDone.current = true;
    const newGrid = {};
    sortedWeekDays.forEach(day => {
      newGrid[day._id] = {};
      displaySessions.forEach(session => {
        newGrid[day._id][session._id] = { course: "", teacher: null, slotId: null };
      });
    });
    timeTableData.timeTable.slots.forEach(slot => {
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

  useEffect(() => {
    setGrid({});
    isInitialLoadDone.current = false;
    setFetchTrigger(false);
  }, [form.classGroup]);

  const handleCourseChange = (dayId, sessionId, courseId, teacherId) => {
    setGrid(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [sessionId]: { ...prev[dayId]?.[sessionId], course: courseId || "", teacher: teacherId } }
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const slotsToUpdate = [];
    Object.keys(grid).forEach(dayId => {
      Object.keys(grid[dayId]).forEach(sessionId => {
        const cell = grid[dayId][sessionId];
        slotsToUpdate.push({ weekDay: dayId, sessionTemplate: sessionId, course: cell.course || null, teacher: cell.teacher || null });
      });
    });
    try {
      await updateTimeTableSlots({ classGroupId: form.classGroup, slots: slotsToUpdate }).unwrap();
      toast.success(t("Saved successfully"));
      navigate("/admin/academic-level/new");
    } catch (err) {
      toast.error(err?.data?.message || t("Error saving"));
    }
  };

  const isEditMode = timeTableData?.timeTable?.slots?.some(slot => slot.course);

  // Compact Styles
  const selectClass = "w-full px-2 py-1.5 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-blue-500 bg-white";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("Timetable")} />
      
      <div className="mx-auto px-4 py-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-800">
            {isEditMode ? t("Edit Timetable") : t("Create Timetable")}
          </h1>
          <button onClick={() => navigate(-1)} className="px-3 py-1 text-[11px] border rounded bg-white hover:bg-gray-50">
            <i className="fa fa-arrow-left mr-1"></i> {t("Back")}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-3">
          {/* Compact Form */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-56">
                <label className={labelClass}>{t("Academic Level")}</label>
                <select className={selectClass} value={form.academicLevel} onChange={(e) => setForm({ ...form, academicLevel: e.target.value, classGroup: "" })}>
                  <option value="">{t("Select Level")}</option>
                  {academicLevels.map(lvl => <option key={lvl._id} value={lvl._id}>{lvl.name}</option>)}
                </select>
              </div>

              <div className="w-56">
                <label className={labelClass}>{t("Class Group")}</label>
                <select className={selectClass} value={form.classGroup} onChange={(e) => setForm({ ...form, classGroup: e.target.value })} disabled={!form.academicLevel}>
                  <option value="">{t("Select Group")}</option>
                  {classGroupsData?.classGroups?.map(grp => (
                    <option key={grp._id} value={grp._id}>{grp.displayName || `${grp.grade?.gradeName} - ${grp.section}`}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setFetchTrigger(true)}
                disabled={!form.classGroup || isFetchingSlots}
                className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {isFetchingSlots ? <i className="fa fa-spinner fa-spin"></i> : t("Fetch")}
              </button>
            </div>
          </div>

          {/* Compact Grid */}
          {timeTableData && (
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 w-32 text-left border-r text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("Session")}</th>
                      {sortedWeekDays.map((day) => (
                        <th key={day._id} className="p-2 border-r last:border-r-0 text-left min-w-[200px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-700">{day.name}</span>
                            {!day.isWorkingDay && <span className="text-[8px] bg-gray-200 text-gray-500 px-1 rounded">OFF</span>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displaySessions.map((session) => (
                      <tr key={session._id}>
                        <td className="p-2 bg-gray-50/50 border-r align-top">
                          <div className="text-[11px] font-bold text-gray-700">{session.name}</div>
                          <div className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap">{session.startTime}-{session.endTime}</div>
                        </td>
                        {sortedWeekDays.map((day) => (
                          <td key={day._id} className="p-2 border-r last:border-r-0 align-top">
                            <SlotCell
                              dayId={day._id}
                              sessionId={session._id}
                              classGroupId={form.classGroup}
                              selectedCourseId={grid[day._id]?.[session._id]?.course || ""}
                              slotId={grid[day._id]?.[session._id]?.slotId}
                              onCourseChange={handleCourseChange}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {timeTableData && (
            <div className="flex justify-end p-2 bg-white border rounded-lg shadow-sm">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? t("Saving...") : t("Save Timetable")}
              </button>
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateTimeTable;