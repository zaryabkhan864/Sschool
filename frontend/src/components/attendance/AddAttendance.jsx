import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import AdminLayout from '../layout/AdminLayout';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';

import { useGetAttendanceMutation, useUpdateAttendanceMutation } from '../../redux/api/attendanceApi.js';
import { useGetGradeByUserIdAndRoleMutation } from '../../redux/api/gradesApi';
import { useTranslation } from 'react-i18next';

const AddAttendance = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState('');
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDetails, setAttendanceDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const { user } = useSelector((state) => state.auth);

  const [formValues, setFormValues] = useState({
    grade: '',
    user: '',
    date: '',
  });

  useEffect(() => {
    if (user && user._id) {
      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        user: user._id,
      }));
      setUserDetails({
        userId: user._id,
        userRole: user.role,
      });
    }
  }, [user]);

  const [sendUserRoleAndID] = useGetGradeByUserIdAndRoleMutation();
  const [updateAttendance, { isLoading: updateAttendanceLoading }] = useUpdateAttendanceMutation();
  const [getAttendance, { isLoading: attendanceLoading }] = useGetAttendanceMutation();

  useEffect(() => {
    if (userDetails.userId && userDetails.userRole) {
      sendUserRoleAndID(userDetails)
        .unwrap()
        .then((response) => {
          setGrades(response.grades || []);
        })
        .catch((err) => console.error('API Error:', err));
    }
  }, [userDetails, sendUserRoleAndID]);

  const fetchAttendanceDetails = async () => {
    if (formValues.grade && selectedDate) {
      try {
        const response = await getAttendance({ ...formValues, date: selectedDate }).unwrap();
        setAttendanceDetails(response.attendance);

        const initialAttendance = {};
        response.attendance.forEach((record) => {
          initialAttendance[record._id] = record;
        });
        setAttendance(initialAttendance);
      } catch (err) {
        setAttendanceDetails(null);
        setAttendance({});
        console.error('Error fetching attendance details:', err);
      }
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, selectedDate]);

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      const payload = {
        attendanceId: attendanceDetails._id,
        records: Object.values(attendance),
      };
      await updateAttendance(payload);
      toast.success('Attendance submitted successfully!');
    } catch (err) {
      console.error('Error submitting attendance:', err);
      toast.error('Failed to submit attendance.');
    }
  };

  return (
    <AdminLayout>
      <MetaData title={'Add Attendance'} />

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('Attendance Management')}</h2>
        <div className="flex flex-wrap gap-4">
          <select
            className="flex-1 min-w-[200px] border border-gray-300 p-3 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            name="grade"
            value={formValues.grade}
            onChange={handleDropdownChange}
          >
            <option value="">{t('Select Grade')}</option>
            {grades.map((grade) => (
              <option key={grade._id} value={grade._id}>
                {grade.gradeName}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="flex-1 min-w-[200px] border border-gray-300 p-3 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {!attendanceDetails && attendanceLoading && <Loader />}

      {attendanceDetails && !attendanceLoading && (
        <div className="bg-white shadow-lg rounded-xl p-6 mt-8 max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-left rounded-lg overflow-hidden">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-gray-600 font-semibold">{t('Student Name')}</th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">{t('Status')}</th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">{t('Remarks')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(attendance).map(([key, value], index) => (
                  <tr
                    key={key}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                  >
                    <td className="py-3 px-4">{value.studentName}</td>
                    <td className="py-3 px-4">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={value.status}
                        onChange={(e) =>
                          setAttendance((prevAttendance) => ({
                            ...prevAttendance,
                            [key]: { ...prevAttendance[key], status: e.target.value },
                          }))
                        }
                      >
                        <option value="present">✅ Present</option>
                        <option value="absent">❌ Absent</option>
                        <option value="late">⏰ Late</option>
                        <option value="half-day">🌓 Half-day</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={value.remarks}
                        onChange={(e) =>
                          setAttendance((prevAttendance) => ({
                            ...prevAttendance,
                            [key]: { ...prevAttendance[key], remarks: e.target.value },
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {Object.keys(attendance).length > 0 && (
            <div className="flex justify-end mt-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 px-6 rounded-lg text-lg font-medium shadow-md"
                onClick={handleSubmitAttendance}
                disabled={updateAttendanceLoading}
              >
                {updateAttendanceLoading ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AddAttendance;
