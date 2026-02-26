// SlotCell.js
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetAvailableCoursesForSlotQuery } from "../../redux/api/timeTableSlotApi";
import SearchableDropdown from "../layout/SearchableDropdown"; 
import toast from "react-hot-toast";

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
console.log("What are Available Courses For slot",data)
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

export default SlotCell;