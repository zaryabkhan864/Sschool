import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

// ===== TIMETABLE APIS =====
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useGetClassGroupsQuery } from "../../redux/api/classGroupApi";
import { useGetWeekDaysQuery } from "../../redux/api/weekDayApi";
import { useGetSessionTemplatesQuery } from "../../redux/api/sessionTemplateApi";
import { useCreateTimeTableSlotMutation } from "../../redux/api/timeTableSlotApi";

const CreateTimeTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ===== BASIC FORM STATE =====
  const [form, setForm] = useState({
    academicLevel: "",
    classGroup: "",
    sessionTemplate: "",
  });

  // ===== GRID STATE =====
  const [grid, setGrid] = useState({});

  // ===== API CALLS =====
  const { data: academicLevels } = useGetAcademicLevelsQuery();
  const { data: classGroups } = useGetClassGroupsQuery(
    { academicLevel: form.academicLevel },
    { skip: !form.academicLevel }
  );
  const { data: weekDays } = useGetWeekDaysQuery();
  const { data: sessionTemplates } = useGetSessionTemplatesQuery(
    { id: form.sessionTemplate },
    { skip: !form.sessionTemplate }
  );

  const [
    createTimeTableSlot,
    { isLoading, isSuccess, error },
  ] = useCreateTimeTableSlotMutation();

  // ===== BUILD EMPTY GRID WHEN TEMPLATE LOADS =====
  useEffect(() => {
    if (
      sessionTemplates?.sessions?.length &&
      weekDays?.days?.length
    ) {
      const tempGrid = {};
      weekDays.days.forEach((day) => {
        tempGrid[day._id] = {};
        sessionTemplates.sessions.forEach((session) => {
          tempGrid[day._id][session._id] = "";
        });
      });
      setGrid(tempGrid);
    }
  }, [sessionTemplates, weekDays]);

  // ===== HANDLE CELL CHANGE =====
  const handleGridChange = (dayId, sessionId, value) => {
    setGrid((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [sessionId]: value,
      },
    }));
  };

  // ===== SUBMIT =====
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.academicLevel || !form.classGroup || !form.sessionTemplate) {
      toast.error("Please complete all selections");
      return;
    }

    const payload = [];

    Object.keys(grid).forEach((dayId) => {
      Object.keys(grid[dayId]).forEach((sessionId) => {
        if (grid[dayId][sessionId]) {
          payload.push({
            academicLevel: form.academicLevel,
            classGroup: form.classGroup,
            day: dayId,
            session: sessionId,
            courseName: grid[dayId][sessionId],
          });
        }
      });
    });

    if (payload.length === 0) {
      toast.error("Please add at least one course in timetable");
      return;
    }

    try {
      await Promise.all(payload.map((item) => createTimeTableSlot(item)));
    } catch (err) {}
  };

  // ===== EFFECTS =====
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Failed to create timetable");
    }
    if (isSuccess) {
      toast.success("Timetable created successfully");
      navigate("/admin/timetable");
    }
  }, [error, isSuccess, navigate]);

  const inputClass =
    "w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none";
  const labelClass =
    "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("Create Timetable")} />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t("Create Timetable")}
            </h1>
            <p className="text-xs text-gray-500">
              {t("Configure class timetable dynamically")}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <i className="fa fa-arrow-left mr-1"></i> {t("Back")}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* CONFIG CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t("Academic Level")}</label>
              <select
                className={inputClass}
                value={form.academicLevel}
                onChange={(e) =>
                  setForm({ ...form, academicLevel: e.target.value })
                }
              >
                <option value="">Select</option>
                {academicLevels?.levels?.map((lvl) => (
                  <option key={lvl._id} value={lvl._id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("Class Group")}</label>
              <select
                className={inputClass}
                value={form.classGroup}
                onChange={(e) =>
                  setForm({ ...form, classGroup: e.target.value })
                }
              >
                <option value="">Select</option>
                {classGroups?.groups?.map((grp) => (
                  <option key={grp._id} value={grp._id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t("Session Template")}</label>
              <select
                className={inputClass}
                value={form.sessionTemplate}
                onChange={(e) =>
                  setForm({ ...form, sessionTemplate: e.target.value })
                }
              >
                <option value="">Select</option>
                {sessionTemplates?.templates?.map((tmp) => (
                  <option key={tmp._id} value={tmp._id}>
                    {tmp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TIMETABLE GRID */}
          {sessionTemplates?.sessions && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-x-auto">
              <table className="min-w-full border text-xs">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50">Session</th>
                    {weekDays?.days?.map((day) => (
                      <th
                        key={day._id}
                        className="border p-2 bg-gray-50"
                      >
                        {day.short}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {sessionTemplates.sessions.map((session) => (
                    <tr key={session._id}>
                      <td className="border p-2 font-semibold bg-gray-50">
                        {session.label}
                      </td>

                      {weekDays.days.map((day) => (
                        <td key={day._id} className="border p-1">
                          <input
                            className={inputClass}
                            placeholder="Course"
                            value={grid?.[day._id]?.[session._id] || ""}
                            onChange={(e) =>
                              handleGridChange(
                                day._id,
                                session._id,
                                e.target.value
                              )
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-semibold bg-gray-100 rounded-lg"
            >
              {t("Cancel")}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-xs font-bold text-white rounded-lg ${
                isLoading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Saving..." : "Save Timetable"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateTimeTable;
