import React, { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toDateOnly = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDisplay = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = MONTHS[date.getMonth()].slice(0, 3);
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

const buildCalendarGrid = (year, month) => {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), currentMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, currentMonth: false });
  }

  return cells;
};

const DatePickerField = ({
  name,
  value,
  onChange,
  placeholder = "Select date",
  min,
  max,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = toDateOnly(value);
  const minDate = toDateOnly(min);
  const maxDate = toDateOnly(max);
  const today = toDateOnly(new Date());

  const [viewDate, setViewDate] = useState(() => selectedDate || maxDate || today);
  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDisabledDate = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();

  const handleSelectDay = (date) => {
    if (isDisabledDate(date)) return;
    onChange({ target: { name, value: formatISO(date) } });
    setIsOpen(false);
  };

  const goToMonth = (offset) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewDate((prev) => new Date(prev.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    if (!isNaN(newYear) && newYear > 1900 && newYear < 2100) {
      setViewDate((prev) => new Date(newYear, prev.getMonth(), 1));
    }
  };

  const handleClear = () => {
    onChange({ target: { name, value: "" } });
    setIsOpen(false);
  };

  const handleToday = () => {
    if (isDisabledDate(today)) return;
    onChange({ target: { name, value: formatISO(today) } });
    setViewDate(today);
    setIsOpen(false);
  };

  const cells = buildCalendarGrid(viewDate.getFullYear(), viewDate.getMonth());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 70 + i);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm-custom border border-surface-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white text-left disabled:bg-surface-50 disabled:cursor-not-allowed"
      >
        <span className={selectedDate ? "text-ink-900" : "text-ink-400"}>
          {selectedDate ? formatDisplay(selectedDate) : placeholder}
        </span>
        <i className="fa fa-calendar text-xs text-ink-400"></i>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-2 bg-white border border-surface-100 rounded-xl shadow-premium p-3 w-80 animate-slide-up">
          {/* Header: Quick Month & Year Selectors */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              <i className="fa fa-chevron-left text-xs"></i>
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewDate.getMonth()}
                onChange={handleMonthChange}
                className="text-xs-custom font-semibold text-ink-900 bg-surface-50 border border-surface-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={viewDate.getFullYear()}
                onChange={handleYearChange}
                className="text-xs-custom font-semibold text-ink-900 bg-surface-50 border border-surface-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => goToMonth(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              <i className="fa fa-chevron-right text-xs"></i>
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center text-xs-custom font-semibold text-ink-400 py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map(({ date, currentMonth }, idx) => {
              const disabledDay = isDisabledDate(date);
              const selected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);

              let dayClass = "text-ink-700 hover:bg-brand-50";
              if (!currentMonth) dayClass = "text-ink-300";
              if (disabledDay) dayClass = "text-ink-300 cursor-not-allowed hover:bg-transparent";
              if (selected) dayClass = "bg-brand-500 text-white font-semibold hover:bg-brand-500";

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(date)}
                  className={`mx-auto w-8 h-8 flex items-center justify-center text-sm-custom rounded-lg transition-colors ${dayClass} ${
                    isToday && !selected ? "border border-brand-500" : ""
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer: Clear / Today */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-100">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm-custom text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              disabled={isDisabledDate(today)}
              className="text-sm-custom text-brand-600 hover:text-brand-700 font-medium disabled:text-ink-300 disabled:cursor-not-allowed"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
