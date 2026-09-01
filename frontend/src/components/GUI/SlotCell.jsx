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

  // Teacher always comes straight from this live response — the backend
  // resolves it fresh from Course.teacher every time, and always makes
  // sure the currently selected course is included even if it's no
  // longer assigned to this class group, so this never goes stale.
  const courseOptions = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses.map((item) => {
      const teacherName = item.teacher
        ? item.teacher.name
        : item.available
        ? t("No teacher assigned")
        : t("Teacher busy");

      return {
        value: item.course._id,
        label: item.course.courseName,
        subtitle: item.course.code || "",
        teacherName,
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
    onCourseChange(dayId, sessionId, courseId);
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
            <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white ${option.disabled ? "bg-ink-400" : "bg-emerald-500"}`}>
              {option.label?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-semibold text-ink-700 truncate leading-none">{option.label}</p>
              <p className="text-[9px] text-ink-400 truncate mt-0.5">
                 {option.teacherName}
              </p>
            </div>
          </div>
        )}
      />

      {selectedCourseId && (
        <div className="flex items-center gap-1.5 bg-brand-50/60 px-2 py-1 rounded-md border border-brand-100">
          <i className="fa fa-user text-brand-500 text-[9px]"></i>
          <span className="text-[10px] text-brand-700 font-medium truncate">
            {selectedTeacher || t("No teacher")}
          </span>
        </div>
      )}
    </div>
  );
};

export default SlotCell;
