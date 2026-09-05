import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import AdminLayout from '../layout/AdminLayout.jsx';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import AppCard from '../GUI/AppCard';
import AppButton from '../GUI/AppButton';
import SearchableDropdown from '../layout/SearchableDropdown';
import DatePickerField from '../GUI/DatePickerField';

import { useGetAttendanceSheetQuery, useSubmitAttendanceMutation } from '../../redux/api/attendanceApi.js';
import { useGetCoursesAndClassGroupByRoleMutation } from '../../redux/api/classGroupApi.js';

const STATUS_OPTIONS = [
  { value: 'present', label: '✅ Present' },
  { value: 'absent', label: '❌ Absent' },
  { value: 'late', label: '⏰ Late' },
  { value: 'half-day', label: '🌓 Half-day' },
  { value: 'excused', label: '📋 Excused' },
];

const getTodayDate = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const AddAttendance = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendance, setAttendance] = useState({});

  // Teacher: only their own courses + the class groups those courses
  // belong to. Admin/principle: everything (see assertCanTakeAttendance
  // on the backend, which lets those roles bypass the ownership check).
  const [fetchRoleData, { data: roleData, isLoading: roleLoading }] =
    useGetCoursesAndClassGroupByRoleMutation();

  useEffect(() => {
    if (user?._id && user?.role) {
      fetchRoleData({ userId: user._id, userRole: user.role });
    }
  }, [user, fetchRoleData]);

  // A Course doesn't store its own classGroup — only ClassGroup.courses
  // points the other way — so build course -> classGroup by scanning each
  // returned class group's populated courses array.
  const courseToClassGroup = useMemo(() => {
    const map = {};
    (roleData?.classGroups || []).forEach((cg) => {
      (cg.courses || []).forEach((c) => {
        const cid = c._id || c;
        map[cid] = cg;
      });
    });
    return map;
  }, [roleData]);

  const courseOptions = useMemo(
    () =>
      (roleData?.courses || []).map((c) => {
        const cg = courseToClassGroup[c._id];
        return {
          value: c._id,
          label: cg ? `${c.courseName} — ${cg.displayName}` : c.courseName,
        };
      }),
    [roleData, courseToClassGroup]
  );

  const selectedClassGroup = courseToClassGroup[selectedCourseId];
  const selectedClassGroupId = selectedClassGroup?._id;
  const canFetchSheet = !!(selectedCourseId && selectedClassGroupId && selectedDate);

  const {
    data: sheetData,
    isFetching: sheetLoading,
    isError: sheetError,
    error: sheetErrorObj,
  } = useGetAttendanceSheetQuery(
    { classGroup: selectedClassGroupId, course: selectedCourseId, date: selectedDate },
    { skip: !canFetchSheet, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (canFetchSheet && sheetData?.roster) {
      const initial = {};
      sheetData.roster.forEach((r) => {
        initial[r.student] = { ...r };
      });
      setAttendance(initial);
    } else if (!canFetchSheet) {
      setAttendance({});
    }
  }, [sheetData, canFetchSheet]);

  const [submitAttendance, { isLoading: isSubmitting }] = useSubmitAttendanceMutation();

  const handleStatusChange = (studentId, field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    const records = Object.entries(attendance).map(([studentId, v]) => ({
      student: studentId,
      status: v.status || 'present',
      remarks: v.remarks || '',
    }));

    if (!records.length) {
      toast.error(t('No students to submit'));
      return;
    }

    try {
      await submitAttendance({
        classGroup: selectedClassGroupId,
        course: selectedCourseId,
        date: selectedDate,
        records,
      }).unwrap();
      toast.success(t('Attendance saved successfully'));
    } catch (err) {
      toast.error(err?.data?.message || t('Failed to save attendance'));
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, 'half-day': 0, excused: 0 };
    Object.values(attendance).forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    return counts;
  }, [attendance]);

  return (
    <AdminLayout>
      <MetaData title={t('Add Attendance')} />

      {roleLoading && <Loader />}

      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <AppCard title={t('Take Attendance')} icon="fa-clipboard-check">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SearchableDropdown
              label={t('Course & Class')}
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              options={courseOptions}
              placeholder={t('Select a course')}
              emptyMessage={t('No courses assigned to you')}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">
                {t('Date')} <span className="text-danger-600">*</span>
              </label>
              <DatePickerField
                name="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={t('Select date')}
                max={getTodayDate()}
              />
            </div>
          </div>

          {!roleLoading && courseOptions.length === 0 && (
            <p className="mt-4 text-sm-custom text-ink-400 text-center">
              {t('No courses or class groups are assigned to you yet.')}
            </p>
          )}
        </AppCard>

        {canFetchSheet && sheetLoading && <Loader />}

        {canFetchSheet && !sheetLoading && sheetError && (
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
              <i className="fa fa-exclamation-triangle text-ink-400"></i>
            </div>
            <div>
              <h3 className="text-sm-custom font-semibold text-ink-900 mb-1">
                {t('Not scheduled')}
              </h3>
              <p className="text-sm-custom text-ink-600">
                {sheetErrorObj?.data?.message ||
                  t("This course isn't scheduled for this class group on the selected date.")}
              </p>
            </div>
          </div>
        )}

        {canFetchSheet && !sheetLoading && !sheetError && sheetData && (
          <AppCard
            title={selectedClassGroup?.displayName}
            subtitle={t('Session attendance for {{date}}', { date: selectedDate })}
            icon="fa-users"
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                <p className="text-lg-custom font-bold text-brand-700">{statusCounts.present}</p>
                <p className="text-xs-custom text-brand-600 font-semibold">{t('Present')}</p>
              </div>
              <div className="bg-surface-100 border border-surface-200 rounded-xl p-3 text-center">
                <p className="text-lg-custom font-bold text-ink-900">{statusCounts.absent}</p>
                <p className="text-xs-custom text-ink-600 font-semibold">{t('Absent')}</p>
              </div>
              <div className="bg-surface-100 border border-surface-200 rounded-xl p-3 text-center">
                <p className="text-lg-custom font-bold text-ink-900">{statusCounts.late}</p>
                <p className="text-xs-custom text-ink-600 font-semibold">{t('Late')}</p>
              </div>
              <div className="bg-surface-100 border border-surface-200 rounded-xl p-3 text-center">
                <p className="text-lg-custom font-bold text-ink-900">{statusCounts['half-day']}</p>
                <p className="text-xs-custom text-ink-600 font-semibold">{t('Half-day')}</p>
              </div>
              <div className="bg-surface-100 border border-surface-200 rounded-xl p-3 text-center">
                <p className="text-lg-custom font-bold text-ink-900">{statusCounts.excused}</p>
                <p className="text-xs-custom text-ink-600 font-semibold">{t('Excused')}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200">
                    <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                      {t('Student')}
                    </th>
                    <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                      {t('Status')}
                    </th>
                    <th className="p-3 text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                      {t('Remarks')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {Object.entries(attendance).map(([studentId, v], idx) => (
                    <tr key={studentId} className="hover:bg-surface-50/70 transition-colors">
                      <td className="p-3 text-sm-custom text-ink-400">{idx + 1}</td>
                      <td className="p-3 text-sm-custom font-semibold text-ink-900">{v.studentName}</td>
                      <td className="p-3">
                        <select
                          value={v.status || 'present'}
                          onChange={(e) => handleStatusChange(studentId, 'status', e.target.value)}
                          className="px-3 py-2 text-sm-custom border border-surface-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none bg-white"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={v.remarks || ''}
                          onChange={(e) => handleStatusChange(studentId, 'remarks', e.target.value)}
                          placeholder={t('Add remarks...')}
                          className="w-full px-3 py-2 text-sm-custom border border-surface-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                  {Object.keys(attendance).length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm-custom text-ink-400">
                        {t('No active students enrolled in this class group.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {Object.keys(attendance).length > 0 && (
              <div className="flex justify-end mt-6 pt-4 border-t border-surface-100">
                <AppButton
                  type="button"
                  onClick={handleSubmit}
                  label={t('Save Attendance')}
                  loadingLabel={t('Saving...')}
                  isLoading={isSubmitting}
                  icon="save"
                />
              </div>
            )}
          </AppCard>
        )}
      </div>
    </AdminLayout>
  );
};

export default AddAttendance;