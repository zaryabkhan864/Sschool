import React from "react";
import { useTranslation } from "react-i18next";
import SlotCell from "./SlotCell";

const TimetableGrid = ({
  weekDays,
  sessions,
  grid,
  classGroupId,
  onCourseChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-2 w-28 text-left border-r text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t("Day")}
            </th>
            {sessions.map((session) => (
              <th
                key={session._id}
                className={`p-2 border-r last:border-r-0 text-left min-w-[180px] ${
                  session.type === "BREAK" ? "bg-orange-50/50" : ""
                }`}
              >
                <div
                  className={`text-[11px] font-bold ${
                    session.type === "BREAK" ? "text-orange-600" : "text-gray-700"
                  }`}
                >
                  {session.name}
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap font-normal normal-case tracking-normal">
                  {session.startTime}-{session.endTime}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {weekDays.map((day) => (
            <tr key={day._id}>
              <td className="p-2 bg-gray-50/50 border-r align-top">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700">{day.name}</span>
                  {!day.isWorkingDay && (
                    <span className="text-[8px] bg-gray-200 text-gray-500 px-1 rounded">OFF</span>
                  )}
                </div>
              </td>
              {sessions.map((session) => (
                <td
                  key={session._id}
                  className={`p-2 border-r last:border-r-0 align-top ${
                    session.type === "BREAK" ? "bg-orange-50/30" : ""
                  }`}
                >
                  {session.type === "BREAK" ? (
                    // Break sessions aren't teachable slots — no course/teacher
                    // dropdown, just a static, non-interactive indicator.
                    <div className="flex items-center justify-center h-9 rounded-lg bg-orange-100/60 text-orange-500 text-[11px] font-bold italic uppercase tracking-wide">
                      <i className="fa fa-coffee mr-1.5 text-[10px]"></i>
                      {t("Break")}
                    </div>
                  ) : (
                    <SlotCell
                      dayId={day._id}
                      sessionId={session._id}
                      classGroupId={classGroupId}
                      selectedCourseId={grid[day._id]?.[session._id]?.course || ""}
                      slotId={grid[day._id]?.[session._id]?.slotId}
                      onCourseChange={onCourseChange}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;
