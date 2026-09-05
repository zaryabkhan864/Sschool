import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import AdminLayout from '../layout/AdminLayout.jsx';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import AppCard from '../GUI/AppCard';
import InfoBlock from '../GUI/InfoBlock';
import PrintLayout from '../GUI/PrintLayout';
import SearchableDropdown from '../layout/SearchableDropdown';
import DatePickerField from '../GUI/DatePickerField';

import { useGetClassGroupsQuery } from '../../redux/api/classGroupApi';
// ⚠️ ASSUMPTION: reusing useGetUserByTypeQuery with `type: "student"` +
// `keyword`. Send authApi.js if student search needs a fix.
import { useGetUserByTypeQuery } from '../../redux/api/authApi';
import { useGetSchoolQuery } from '../../redux/api/schoolApi';
import {
  useGetAttendanceHistoryQuery,
  useGetClassAttendanceCalendarQuery,
} from '../../redux/api/attendanceApi';

const STATUS_CODE = { present: 'P', absent: 'A', late: 'L', 'half-day': 'H', excused: 'E' };
const STATUS_CELL_CLASS = {
  present: 'bg-green-50 text-green-700',
  absent: 'bg-red-50 text-red-700',
  late: 'bg-amber-50 text-amber-700',
  'half-day': 'bg-gray-100 text-gray-600',
  excused: 'bg-gray-100 text-gray-600',
};
const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  'half-day': 'Half-day',
  excused: 'Excused',
};

const getTodayDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const firstDayOfMonth = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const lastDayOfMonth = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
};

const fullName = (u) =>
  u ? [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ') : '';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatMonth = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

// A compact pill-style segmented control — replaces loose standalone
// buttons so a two-option toggle reads as one control, not two buttons
// that happen to sit near each other.
const SegmentedToggle = ({ value, onChange, options }) => (
  <div className="inline-flex bg-surface-100 rounded-xl p-1 gap-1">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-4 py-2 rounded-lg text-sm-custom font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
          value === opt.value
            ? 'bg-white text-brand-600 shadow-soft'
            : 'text-ink-600 hover:text-ink-900'
        }`}
      >
        <i className={`fa fa-${opt.icon}`}></i>
        {opt.label}
      </button>
    ))}
  </div>
);

const AttendanceReport = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const isTeacher = user?.role === 'teacher';
  const contentRef = React.useRef(null);

  const { data: schoolData } = useGetSchoolQuery();
  const schoolName = schoolData?.name || 'Sunrise International School';
  const schoolLogo = schoolData?.logo?.url || '/images/Logo.png';
  const schoolTagline = schoolData?.tagline || 'Excellence in Education';
  const schoolAddress = schoolData?.address || '123 Education Avenue, Knowledge City';

  const [reportType, setReportType] = useState('class'); // 'class' | 'student'
  const [period, setPeriod] = useState('day'); // 'day' | 'month'
  const [monthView, setMonthView] = useState('daily'); // 'daily' | 'sessions' — class+month only
  const [anchorDate, setAnchorDate] = useState(getTodayDate());
  const [classGroupId, setClassGroupId] = useState('');
  const [classGroupLabel, setClassGroupLabel] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentLabel, setStudentLabel] = useState('');

  const { data: classGroupsData, isFetching: classGroupsLoading } = useGetClassGroupsQuery(
    {
      status: 'active',
      paginate: 'false',
      ...(isTeacher && user?._id ? { teacherId: user._id } : {}),
    },
    { skip: reportType !== 'class' }
  );
  const classGroupOptions = useMemo(
    () => (classGroupsData?.classGroups || []).map((g) => ({ value: g._id, label: g.displayName })),
    [classGroupsData]
  );

  const { data: studentsData, isFetching: studentsLoading } = useGetUserByTypeQuery(
    { type: 'student', keyword: studentSearch },
    { skip: reportType !== 'student' || studentSearch.length < 1 }
  );
  const studentOptions = useMemo(
    () =>
      (studentsData?.users || studentsData || []).map((s) => ({
        value: s._id,
        label: fullName(s),
      })),
    [studentsData]
  );

  const from = period === 'day' ? anchorDate : firstDayOfMonth(anchorDate);
  const to = period === 'day' ? anchorDate : lastDayOfMonth(anchorDate);

  const canRunClassMonth =
    reportType === 'class' && period === 'month' && monthView === 'daily' && !!classGroupId;
  const canRunHistory =
    (reportType === 'class' && period === 'day' && !!classGroupId) ||
    (reportType === 'class' && period === 'month' && monthView === 'sessions' && !!classGroupId) ||
    (reportType === 'student' && !!studentId);

  const { data: calendarData, isFetching: calendarLoading } = useGetClassAttendanceCalendarQuery(
    { classGroup: classGroupId, from, to },
    { skip: !canRunClassMonth }
  );

  const { data: historyData, isFetching: historyLoading } = useGetAttendanceHistoryQuery(
    {
      ...(reportType === 'class' ? { classGroup: classGroupId } : {}),
      ...(reportType === 'student' ? { student: studentId } : {}),
      from,
      to,
    },
    { skip: !canRunHistory }
  );

  const isBusy = calendarLoading || historyLoading;
  const hasReport = (canRunClassMonth && calendarData) || (canRunHistory && historyData);

  const periodLabel = period === 'day' ? formatDate(anchorDate) : formatMonth(anchorDate);
  const subjectLabel = reportType === 'class' ? classGroupLabel : studentLabel;
  const documentName = `Attendance-${reportType}-${period}-${anchorDate}`;

  // CLASS + DAY — pivot the day's session documents into one grid: every
  // student who appears in any session that day as a row, every session
  // that ran as a column, each cell a single status letter. This is what
  // an actual attendance register looks like, instead of one card per
  // session with its own mini student list.
  const classDaySheet = useMemo(() => {
    if (!(reportType === 'class' && period === 'day' && historyData?.attendances)) return null;

    const sessions = historyData.attendances;
    const studentMap = new Map();
    sessions.forEach((att) => {
      att.records.forEach((r) => {
        const sid = (r.student?._id || r.student)?.toString();
        if (sid && !studentMap.has(sid)) {
          studentMap.set(sid, { id: sid, name: fullName(r.student) });
        }
      });
    });
    const students = Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    const columns = sessions
      .map((att) => ({
        id: att._id,
        label: att.sessionTemplate?.name || '',
        time: `${att.sessionTemplate?.startTime || ''}-${att.sessionTemplate?.endTime || ''}`,
        byStudent: new Map(
          att.records.map((r) => [(r.student?._id || r.student)?.toString(), r.status])
        ),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return { students, columns };
  }, [reportType, period, historyData]);

  // CLASS + MONTH — one status letter per student per DAY (not per
  // session): if a student had multiple sessions in a day with mixed
  // statuses, the backend already collapsed it to the worst one. Totals
  // (Present count / % Present) are computed here from the small day map.
  const classMonthSheet = useMemo(() => {
    if (!(canRunClassMonth && calendarData)) return null;

    const students = calendarData.students.map((s) => {
      const counts = { present: 0, absent: 0, late: 0, 'half-day': 0, excused: 0 };
      const dayValues = Object.values(s.days || {});
      dayValues.forEach((status) => {
        if (counts[status] !== undefined) counts[status] += 1;
      });
      const total = dayValues.length;
      const percentPresent = total ? Math.round((counts.present / total) * 100) : 0;
      return { ...s, counts, total, percentPresent };
    });

    return { dates: calendarData.dates, students };
  }, [canRunClassMonth, calendarData]);

  // CLASS + MONTH + "By Session" — full detail, uncollapsed: every session
  // that ran that month, each showing the whole class's per-student status
  // (not squashed into one letter per day). Rendered as a list of blocks
  // rather than a grid since a month's worth of sessions (days × periods)
  // would make a session-per-column grid impossibly wide.
  const classSessionBlocks = useMemo(() => {
    if (
      !(
        reportType === 'class' &&
        period === 'month' &&
        monthView === 'sessions' &&
        historyData?.attendances
      )
    )
      return null;

    return [...historyData.attendances].sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return (a.sessionTemplate?.startTime || '').localeCompare(b.sessionTemplate?.startTime || '');
    });
  }, [reportType, period, monthView, historyData]);

  // STUDENT (day or month) — one ledger row per session that student had
  // in the range, pulled out of the whole-class documents the API returns.
  const studentLedger = useMemo(() => {
    if (!(reportType === 'student' && historyData?.attendances)) return null;

    return historyData.attendances
      .map((att) => {
        const rec = att.records.find(
          (r) => (r.student?._id || r.student)?.toString() === studentId
        );
        return {
          id: att._id,
          date: att.date,
          sessionName: att.sessionTemplate?.name,
          time: `${att.sessionTemplate?.startTime || ''}-${att.sessionTemplate?.endTime || ''}`,
          course: att.course?.courseName,
          status: rec?.status,
          remarks: rec?.remarks,
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [reportType, historyData, studentId]);

  return (
    <AdminLayout>
      <MetaData title={t('Attendance Report')} />

      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* ---------- Filters (screen only — not part of the printed document) ---------- */}
        <AppCard title={t('Attendance Report')} icon="fa-chart-bar">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <SegmentedToggle
              value={reportType}
              onChange={(val) => {
                setReportType(val);
                if (val === 'class') {
                  setStudentId('');
                  setStudentLabel('');
                  setStudentSearch('');
                } else {
                  setClassGroupId('');
                  setClassGroupLabel('');
                }
              }}
              options={[
                { value: 'class', label: t('By Class'), icon: 'users' },
                { value: 'student', label: t('By Student'), icon: 'user' },
              ]}
            />
            <div className="w-px h-8 bg-surface-200 hidden sm:block" />
            <SegmentedToggle
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'day', label: t('Day'), icon: 'calendar-day' },
                { value: 'month', label: t('Month'), icon: 'calendar-alt' },
              ]}
            />
            {reportType === 'class' && period === 'month' && (
              <>
                <div className="w-px h-8 bg-surface-200 hidden sm:block" />
                <SegmentedToggle
                  value={monthView}
                  onChange={setMonthView}
                  options={[
                    { value: 'daily', label: t('By Day'), icon: 'calendar-day' },
                    { value: 'sessions', label: t('By Session'), icon: 'list' },
                  ]}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reportType === 'class' ? (
              <SearchableDropdown
                label={t('Class Group')}
                value={classGroupId}
                onChange={(val) => {
                  setClassGroupId(val);
                  const opt = classGroupOptions.find((o) => o.value === val);
                  setClassGroupLabel(opt?.label || '');
                }}
                options={classGroupOptions}
                isLoading={classGroupsLoading}
                placeholder={t('Select class group')}
                emptyMessage={t('No class groups found')}
                showSelected={false}
              />
            ) : (
              <SearchableDropdown
                label={t('Student')}
                value={studentId}
                onChange={(val) => {
                  setStudentId(val);
                  const opt = studentOptions.find((o) => o.value === val);
                  setStudentLabel(opt?.label || '');
                }}
                onSearch={setStudentSearch}
                options={studentOptions}
                isLoading={studentsLoading}
                placeholder={t('Search for a student...')}
                emptyMessage={t('No students found')}
                showSelected={false}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
                {period === 'day' ? t('Date') : t('Any date in the month')}
              </label>
              <DatePickerField
                name="anchorDate"
                value={anchorDate}
                onChange={(e) => setAnchorDate(e.target.value)}
                placeholder={t('Select date')}
                max={getTodayDate()}
              />
            </div>
          </div>
        </AppCard>

        {isBusy && <Loader />}

        {/* ---------- Printable / downloadable official attendance sheet ---------- */}
        {!isBusy && hasReport && (
          <PrintLayout
            title={t('Attendance Report')}
            subtitle={
              reportType === 'class' ? t('Class Attendance Record') : t('Student Attendance Record')
            }
            documentName={documentName}
            contentRef={contentRef}
          >
            <AppCard className="relative bg-white p-10 border border-gray-300 shadow-sm print:shadow-none print:border-gray-400 print:border-2 overflow-hidden">
              <div className="relative z-10">
                {/* Letterhead */}
                <div className="flex justify-between items-center border-b-2 border-gray-800 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={schoolLogo}
                      alt={schoolName}
                      className="h-14 w-14 object-contain print:grayscale"
                    />
                    <div>
                      <h1 className="text-lg font-serif font-bold text-gray-900 uppercase tracking-tight">
                        {schoolName}
                      </h1>
                      <p className="text-xs text-gray-600 italic">{schoolTagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {t('Report ID')}: <span className="text-gray-800">ATT-{Date.now().toString().slice(-8)}</span>
                    </p>
                    <p className="text-[10px] font-medium text-gray-600 mt-0.5">
                      {t('Issue Date')}: {new Date().toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                {/* Report subject header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                    {t('Attendance Sheet')}
                  </h2>
                  <div className="grid grid-cols-3 gap-6">
                    <InfoBlock
                      label={reportType === 'class' ? t('Class Group') : t('Student')}
                      value={subjectLabel || '—'}
                    />
                    <InfoBlock label={t('Period')} value={period === 'day' ? t('Daily') : t('Monthly')} />
                    <InfoBlock label={period === 'day' ? t('Date') : t('Month')} value={periodLabel} />
                  </div>
                </div>

                {/* CLASS + DAY — attendance register grid: students × sessions */}
                {classDaySheet && (
                  <section>
                    {classDaySheet.students.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        {t('No attendance recorded for this period.')}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-800">
                              <th className="py-2 pr-2 text-left font-bold text-gray-700 uppercase text-[10px] tracking-wider sticky left-0 bg-white">
                                {t('Student')}
                              </th>
                              {classDaySheet.columns.map((col) => (
                                <th
                                  key={col.id}
                                  className="py-2 px-1 text-center font-bold text-gray-700 uppercase text-[10px] tracking-wider"
                                >
                                  {col.label}
                                  <div className="font-normal normal-case text-gray-400">{col.time}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {classDaySheet.students.map((s) => (
                              <tr key={s.id}>
                                <td className="py-1.5 pr-2 font-medium text-gray-900 sticky left-0 bg-white whitespace-nowrap">
                                  {s.name}
                                </td>
                                {classDaySheet.columns.map((col) => {
                                  const status = col.byStudent.get(s.id);
                                  return (
                                    <td key={col.id} className="py-1.5 px-1 text-center">
                                      {status ? (
                                        <span
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${STATUS_CELL_CLASS[status]}`}
                                          title={STATUS_LABELS[status]}
                                        >
                                          {STATUS_CODE[status]}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">–</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[10px] text-gray-400 mt-3">
                          {t('P = Present, A = Absent, L = Late, H = Half-day, E = Excused')}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* CLASS + MONTH — attendance register grid: students × dates */}
                {classMonthSheet && (
                  <section>
                    {classMonthSheet.students.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        {t('No attendance recorded for this period.')}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-800">
                              <th className="py-2 pr-2 text-left font-bold text-gray-700 uppercase text-[10px] tracking-wider sticky left-0 bg-white">
                                {t('Student')}
                              </th>
                              {classMonthSheet.dates.map((d) => (
                                <th
                                  key={d}
                                  className="py-2 px-1 text-center font-bold text-gray-700 text-[10px]"
                                >
                                  {formatShortDate(d)}
                                </th>
                              ))}
                              <th className="py-2 px-2 text-center font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                                {t('Present')}
                              </th>
                              <th className="py-2 px-2 text-center font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                                {t('%')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {classMonthSheet.students.map((s) => (
                              <tr key={s.studentId}>
                                <td className="py-1.5 pr-2 font-medium text-gray-900 sticky left-0 bg-white whitespace-nowrap">
                                  {s.name}
                                </td>
                                {classMonthSheet.dates.map((d) => {
                                  const status = s.days?.[d];
                                  return (
                                    <td key={d} className="py-1.5 px-1 text-center">
                                      {status ? (
                                        <span
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${STATUS_CELL_CLASS[status]}`}
                                          title={STATUS_LABELS[status]}
                                        >
                                          {STATUS_CODE[status]}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">–</span>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="py-1.5 px-2 text-center font-semibold text-gray-900">
                                  {s.counts.present}/{s.total}
                                </td>
                                <td className="py-1.5 px-2 text-center font-semibold text-gray-900">
                                  {s.percentPresent}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-[10px] text-gray-400 mt-3">
                          {t(
                            'P = Present, A = Absent, L = Late, H = Half-day, E = Excused. A day with mixed session statuses shows the most serious one (Absent > Late > Half-day > Excused > Present).'
                          )}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* CLASS + MONTH + By Session — full detail, uncollapsed */}
                {classSessionBlocks && (
                  <section>
                    {classSessionBlocks.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        {t('No attendance recorded for this period.')}
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {classSessionBlocks.map((att) => (
                          <div key={att._id} className="border border-gray-200 rounded-md p-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatShortDate(att.date)} · {att.course?.courseName}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {att.sessionTemplate?.name} ({att.sessionTemplate?.startTime}–
                              {att.sessionTemplate?.endTime})
                            </p>
                            <table className="w-full border-collapse text-sm">
                              <tbody className="divide-y divide-gray-100">
                                {att.records.map((r) => (
                                  <tr key={r.student?._id || r.student}>
                                    <td className="py-1.5 text-gray-800">{fullName(r.student)}</td>
                                    <td className="py-1.5 text-center w-10">
                                      <span
                                        className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${STATUS_CELL_CLASS[r.status]}`}
                                        title={STATUS_LABELS[r.status]}
                                      >
                                        {STATUS_CODE[r.status]}
                                      </span>
                                    </td>
                                    {r.remarks && (
                                      <td className="py-1.5 text-gray-500 text-xs pl-4">{r.remarks}</td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* STUDENT (day or month) — ledger sheet: one row per session */}
                {studentLedger && (
                  <section>
                    {studentLedger.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        {t('No attendance recorded for this period.')}
                      </p>
                    ) : (
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-800">
                            <th className="py-2 text-left font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                              {t('Date')}
                            </th>
                            <th className="py-2 text-left font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                              {t('Session')}
                            </th>
                            <th className="py-2 text-left font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                              {t('Course')}
                            </th>
                            <th className="py-2 text-center font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                              {t('Status')}
                            </th>
                            <th className="py-2 text-left font-bold text-gray-700 uppercase text-[10px] tracking-wider">
                              {t('Remarks')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {studentLedger.map((row) => (
                            <tr key={row.id}>
                              <td className="py-1.5 text-gray-800">{formatShortDate(row.date)}</td>
                              <td className="py-1.5 text-gray-800">
                                {row.sessionName}
                                <span className="text-gray-400 text-xs"> ({row.time})</span>
                              </td>
                              <td className="py-1.5 text-gray-800">{row.course}</td>
                              <td className="py-1.5 text-center">
                                {row.status && (
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${STATUS_CELL_CLASS[row.status]}`}
                                    title={STATUS_LABELS[row.status]}
                                  >
                                    {STATUS_CODE[row.status]}
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 text-gray-500 text-xs">{row.remarks || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                )}

                {/* Official Signatures */}
                <div className="mt-14 pt-6 border-t-2 border-gray-300">
                  <div className="flex justify-between">
                    <div className="text-center w-44">
                      <div className="h-px bg-gray-400 w-full mb-2"></div>
                      <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        {t("Class Teacher's Signature")}
                      </p>
                    </div>
                    <div className="text-center w-44">
                      <div className="h-px bg-gray-400 w-full mb-2"></div>
                      <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        {t("Principal's Signature")}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[9px] text-gray-400 mt-6">
                  {t('This is a computer-generated document and does not require a physical signature.')}
                </p>
              </div>
            </AppCard>
          </PrintLayout>
        )}
      </div>

      <style jsx>{`
        @media print {
          @page {
            size: portrait;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AttendanceReport;