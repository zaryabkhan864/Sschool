import React from "react";
import { useTranslation } from "react-i18next";
import SlotCell from "./SlotCell";

const TimetableGrid = ({
  weekDays,
  sessions,
  grid,
  classGroupId,
  onCourseChange,
  allowedSessionsByDay = {},
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-50 border-b border-surface-200">
            <th className="p-2 w-28 text-left border-r border-surface-200 text-[10px] font-bold text-ink-400 uppercase tracking-wider">
              {t("Day")}
            </th>
            {sessions.map((session) => (
              <th
                key={session._id}
                className={`p-2 border-r border-surface-200 last:border-r-0 text-left min-w-[180px] ${
                  session.type === "BREAK" ? "bg-surface-100" : ""
                }`}
              >
                <div
                  className={`text-[11px] font-bold ${
                    session.type === "BREAK" ? "text-ink-600" : "text-ink-700"
                  }`}
                >
                  {session.name}
                </div>
                <div className="text-[9px] text-ink-400 mt-0.5 whitespace-nowrap font-normal normal-case tracking-normal">
                  {session.startTime}-{session.endTime}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {weekDays.map((day) => {
            // undefined = no Day Session Template config exists for this day
            // yet at all; a Set (even empty) = configured, only these
            // periods run that day.
            const allowedIds = allowedSessionsByDay[day._id];
            const dayIsConfigured = allowedIds !== undefined;

            return (
              <tr key={day._id}>
                <td className="p-2 bg-surface-50 border-r border-surface-100 align-top">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs-custom font-bold text-ink-700">{day.name}</span>
                    {!day.isWorkingDay && (
                      <span className="text-[8px] bg-surface-200 text-ink-600 px-1 rounded">
                        OFF
                      </span>
                    )}
                  </div>
                </td>
                {sessions.map((session) => {
                  if (session.type === "BREAK") {
                    // Break sessions aren't teachable slots — no course/teacher
                    // dropdown, just a static, non-interactive indicator.
                    return (
                      <td
                        key={session._id}
                        className="p-2 border-r border-surface-100 last:border-r-0 align-top bg-surface-50"
                      >
                        <div className="flex items-center justify-center h-9 rounded-lg bg-surface-100 text-ink-600 text-[11px] font-bold italic uppercase tracking-wide">
                          <i className="fa fa-coffee mr-1.5 text-[10px]"></i>
                          {t("Break")}
                        </div>
                      </td>
                    );
                  }

                  const isAllowed = dayIsConfigured && allowedIds.has(session._id);

                  if (!isAllowed) {
                    // Per the Day Session Template, this period doesn't run
                    // on this day — e.g. Friday's 9th period when Fri only
                    // has 8. Distinct label if the day has no config at all.
                    return (
                      <td key={session._id} className="p-2 border-r border-surface-100 last:border-r-0 align-top">
                        <div className="flex items-center justify-center h-9 rounded-lg bg-surface-50 border border-dashed border-surface-200 text-ink-300 text-[11px] font-medium italic">
                          {dayIsConfigured ? t("No class") : t("Not set up")}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={session._id} className="p-2 border-r border-surface-100 last:border-r-0 align-top">
                      <SlotCell
                        dayId={day._id}
                        sessionId={session._id}
                        classGroupId={classGroupId}
                        selectedCourseId={grid[day._id]?.[session._id]?.course || ""}
                        slotId={grid[day._id]?.[session._id]?.slotId}
                        onCourseChange={onCourseChange}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;