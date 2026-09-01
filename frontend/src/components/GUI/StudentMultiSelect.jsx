// components/GUI/StudentMultiSelect.jsx
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

/**
 * props:
 *  - students: array of user objects ({ _id, firstName, middleName, lastName, userId })
 *  - selected: array of selected student ids
 *  - onChange: (nextSelectedIds: string[]) => void
 *  - isLoading: boolean
 *  - label: string
 */
const StudentMultiSelect = ({ students = [], selected = [], onChange, isLoading, label }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const fullName = getFullName(s).toLowerCase();
      return fullName.includes(q) || s.userId?.toLowerCase().includes(q);
    });
  }, [students, search]);

  const toggleStudent = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((sid) => sid !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange(filtered.map((s) => s._id));
  const clearAll = () => onChange([]);

  return (
    <div>
      {label && (
        <label className="block text-sm-custom font-medium text-ink-900 mb-1.5">{label}</label>
      )}

      <div className="border border-surface-200 rounded-xl bg-white overflow-hidden">
        <div className="p-3 border-b border-surface-100 flex items-center gap-2">
          <i className="fa fa-search text-ink-400 text-xs"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search students...")}
            className="flex-1 text-sm-custom outline-none placeholder:text-ink-400"
          />
          <span className="text-xs-custom text-ink-400">
            {selected.length} {t("selected")}
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm-custom text-ink-400">
              <i className="fa fa-spinner fa-spin mr-2"></i>
              {t("Loading students...")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm-custom text-ink-400">{t("No students found")}</div>
          ) : (
            filtered.map((student) => (
              <label
                key={student._id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 cursor-pointer border-b border-surface-50 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(student._id)}
                  onChange={() => toggleStudent(student._id)}
                  className="rounded-md border-surface-300 text-brand-600 focus:ring-brand-500/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm-custom font-medium text-ink-900 truncate">{getFullName(student)}</p>
                  {student.userId && (
                    <p className="text-xs-custom text-ink-400">{student.userId}</p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-between px-3 py-2 bg-surface-50 border-t border-surface-100">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs-custom font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("Select all")}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs-custom font-semibold text-ink-600 hover:text-ink-700"
          >
            {t("Clear")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentMultiSelect;
