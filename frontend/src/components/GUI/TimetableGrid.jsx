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
            <th className="p-2 w-32 text-left border-r text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t("Session")}
            </th>
            {weekDays.map((day) => (
              <th key={day._id} className="p-2 border-r last:border-r-0 text-left min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700">{day.name}</span>
                  {!day.isWorkingDay && (
                    <span className="text-[8px] bg-gray-200 text-gray-500 px-1 rounded">OFF</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {sessions.map((session) => (
            <tr key={session._id}>
              <td className="p-2 bg-gray-50/50 border-r align-top">
                <div className="text-[11px] font-bold text-gray-700">{session.name}</div>
                <div className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap">
                  {session.startTime}-{session.endTime}
                </div>
              </td>
              {weekDays.map((day) => (
                <td key={day._id} className="p-2 border-r last:border-r-0 align-top">
                  <SlotCell
                    dayId={day._id}
                    sessionId={session._id}
                    classGroupId={classGroupId}
                    selectedCourseId={grid[day._id]?.[session._id]?.course || ""}
                    slotId={grid[day._id]?.[session._id]?.slotId}
                    onCourseChange={onCourseChange}
                  />
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