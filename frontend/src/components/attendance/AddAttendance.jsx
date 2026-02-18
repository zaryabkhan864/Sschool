import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import { useGetAttendanceMutation, useUpdateAttendanceMutation } from '../../redux/api/attendanceApi.js';

import { useTranslation } from 'react-i18next';
import AdminLayout from '../GUI/AdminLayout.jsx';
import { useGetCoursesByRoleQuery } from '../../redux/api/courseApi.js';

const AddAttendance = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState('');
  const [classGroups, setClassGroups] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDetails, setAttendanceDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClassGroup, setSelectedClassGroup] = useState('');

  const { user } = useSelector((state) => state.auth);

  const [formValues, setFormValues] = useState({
    classGroup: '',
    user: '',
    date: '',
    campus: '',
    year: ''
  });

  // 1. Get user details and set user field in formValues
  useEffect(() => {
    if (user && user._id) {
      const campusFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("campus="))
        ?.split("=")[1];

      const yearFromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("selectedYear="))
        ?.split("=")[1];

      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        user: user._id,
        campus: campusFromCookie,
        year: Number(yearFromCookie)
      }));

      setUserDetails({
        userId: user._id,
        userRole: user.role,
      });
    }
  }, [user]);

  // 2. Get class groups based on user role
  const { 
    data: roleData, 
    isLoading: roleLoading,
    refetch: refetchRoleData 
  } = useGetCoursesByRoleQuery({
    userId: userDetails.userId,
    userRole: userDetails.userRole
  }, {
    skip: !userDetails.userId || !userDetails.userRole,
    refetchOnMountOrArgChange: true
  });

  // 3. Process role data when it loads
  useEffect(() => {
    if (roleData) {
      // Set class groups
      const allClassGroups = roleData.classGroups || [];
      setClassGroups(allClassGroups);
    }
  }, [roleData]);

  const [updateAttendance, { isLoading: updateAttendanceLoading }] = useUpdateAttendanceMutation();
  const [getAttendance, { isLoading: attendanceLoading }] = useGetAttendanceMutation();

  const fetchAttendanceDetails = async () => {
    if (formValues.classGroup && selectedDate && formValues.campus && formValues.year) {
      try {
        // Get the selected class group to extract grade
        const currentClassGroup = classGroups.find(
          group => group._id === formValues.classGroup
        );
        
        if (!currentClassGroup) {
          toast.error('Selected class group not found');
          return;
        }

        const attendancePayload = {
          grade: currentClassGroup.grade?._id || formValues.classGroup,
          classGroup: formValues.classGroup,
          date: selectedDate,
          user: formValues.user,
          campus: formValues.campus,
          year: formValues.year
        };

        const response = await getAttendance(attendancePayload).unwrap();
        
        // Check if response has attendance array or single object
        if (response.attendance) {
          // If it's an array, take the first one or handle multiple
          const attendanceRecord = Array.isArray(response.attendance) 
            ? response.attendance[0] 
            : response.attendance;
          
          setAttendanceDetails(attendanceRecord);

          if (attendanceRecord && attendanceRecord.students) {
            const initialAttendance = {};
            attendanceRecord.students.forEach((record) => {
              initialAttendance[record.student?._id || record.student] = {
                ...record,
                studentId: record.student?._id || record.student,
                studentName: record.student?.name || record.studentName || 'Unknown Student'
              };
            });
            setAttendance(initialAttendance);
          } else {
            setAttendance({});
          }
        } else {
          // No attendance record found for this date
          setAttendanceDetails(null);
          setAttendance({});
          toast.info('No attendance record found for this date. You can create a new one.');
          
          // Optionally, you might want to pre-fetch students for this class group
          // to create a new attendance record
        }
      } catch (err) {
        console.error('Error fetching attendance details:', err);
        if (err.status === 404) {
          toast.info('No attendance record found for this date.');
        } else {
          toast.error('Failed to fetch attendance details.');
        }
        setAttendanceDetails(null);
        setAttendance({});
      }
    }
  };

  useEffect(() => {
    if (formValues.classGroup && selectedDate) {
      fetchAttendanceDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.classGroup, selectedDate]);

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear attendance data when class group changes
    if (name === 'classGroup') {
      setAttendanceDetails(null);
      setAttendance({});
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFormValues(prev => ({ ...prev, date }));
  };

  const handleStatusChange = (studentId, field, value) => {
    setAttendance(prevAttendance => ({
      ...prevAttendance,
      [studentId]: { 
        ...prevAttendance[studentId], 
        [field]: value 
      }
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!formValues.classGroup || !selectedDate) {
      toast.error('Please select class group and date');
      return;
    }

    try {
      // Get current class group for grade reference
      const currentClassGroup = classGroups.find(
        group => group._id === formValues.classGroup
      );

      // Prepare attendance records
      const records = Object.values(attendance).map(record => ({
        student: record.studentId || record.student,
        status: record.status || 'present',
        remarks: record.remarks || '',
        studentName: record.studentName
      }));

      const payload = {
        grade: currentClassGroup?.grade?._id || formValues.classGroup,
        classGroup: formValues.classGroup,
        date: selectedDate,
        user: formValues.user,
        campus: formValues.campus,
        year: formValues.year,
        students: records
      };

      // If we have an existing attendance record, update it
      if (attendanceDetails && attendanceDetails._id) {
        payload.attendanceId = attendanceDetails._id;
      }

      await updateAttendance(payload).unwrap();
      toast.success('Attendance submitted successfully!');
      
      // Refresh attendance data
      fetchAttendanceDetails();
    } catch (err) {
      console.error('Error submitting attendance:', err);
      toast.error('Failed to submit attendance.');
    }
  };

  // Helper function to get display name for class group
  const getClassGroupDisplay = (classGroup) => {
    if (!classGroup) return '';
    
    if (classGroup.displayName) {
      return classGroup.displayName;
    }
    
    const gradeName = classGroup.grade?.gradeName || 'Grade';
    return `${gradeName} - ${classGroup.section}`;
  };

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Initialize date to today
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getTodayDate());
      setFormValues(prev => ({ ...prev, date: getTodayDate() }));
    }
  }, []);

  // Check if attendance can be fetched
  const canFetchAttendance = formValues.classGroup && selectedDate;

  return (
    <AdminLayout>
      <MetaData title={'Add Attendance'} />

      {/* Show loader while fetching role data */}
      {roleLoading && <Loader />}

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('Attendance Management')}</h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Class Group Dropdown */}
          <select
            className="flex-1 min-w-[200px] border border-gray-300 p-3 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            name="classGroup"
            value={formValues.classGroup}
            onChange={handleDropdownChange}
            disabled={roleLoading || classGroups.length === 0}
          >
            <option value="">{t('Select Class/Section')}</option>
            {classGroups.map((classGroup) => (
              <option key={classGroup._id} value={classGroup._id}>
                {getClassGroupDisplay(classGroup)}
              </option>
            ))}
          </select>

          {/* Date Picker */}
          <input
            type="date"
            className="flex-1 min-w-[200px] border border-gray-300 p-3 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedDate}
            onChange={handleDateChange}
            max={getTodayDate()}
          />

          {/* Fetch Button */}
          {canFetchAttendance && !attendanceDetails && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={fetchAttendanceDetails}
              disabled={attendanceLoading}
            >
              {attendanceLoading ? 'Loading...' : 'Load Attendance'}
            </button>
          )}
        </div>

        {/* No data message */}
        {!roleLoading && classGroups.length === 0 && (
          <div className="mt-4 text-center text-gray-500">
            <p>No class groups assigned to you.</p>
          </div>
        )}
      </div>

      {attendanceLoading && <Loader />}

      {attendanceDetails && !attendanceLoading && (
        <div className="bg-white shadow-lg rounded-xl p-6 mt-8 max-w-6xl mx-auto">
          {/* Header with attendance info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
              <div>
                <span className="font-medium">Date: </span>
                <span>{new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div>
                <span className="font-medium">Class/Section: </span>
                <span>
                  {classGroups.find(g => g._id === formValues.classGroup) 
                    ? getClassGroupDisplay(classGroups.find(g => g._id === formValues.classGroup))
                    : 'N/A'
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">Record ID: </span>
                <span className="text-gray-600">{attendanceDetails._id?.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          {Object.keys(attendance).length > 0 && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(attendance).filter(a => a.status === 'present').length}
                </div>
                <div className="text-sm text-green-700">Present</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(attendance).filter(a => a.status === 'absent').length}
                </div>
                <div className="text-sm text-red-700">Absent</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(attendance).filter(a => a.status === 'late').length}
                </div>
                <div className="text-sm text-yellow-700">Late</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(attendance).filter(a => a.status === 'half-day').length}
                </div>
                <div className="text-sm text-purple-700">Half-day</div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-left rounded-lg overflow-hidden">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-gray-600 font-semibold">#</th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">{t('Student Name')}</th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">{t('Status')}</th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">{t('Remarks')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(attendance).length > 0 ? (
                  Object.entries(attendance).map(([studentId, value], index) => (
                    <tr
                      key={studentId}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                    >
                      <td className="py-3 px-4 font-medium">{index + 1}</td>
                      <td className="py-3 px-4">{value.studentName}</td>
                      <td className="py-3 px-4">
                        <select
                          className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
                          value={value.status || 'present'}
                          onChange={(e) => handleStatusChange(studentId, 'status', e.target.value)}
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
                          value={value.remarks || ''}
                          onChange={(e) => handleStatusChange(studentId, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No students found in this class group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          {Object.keys(attendance).length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Total students: {Object.keys(attendance).length}
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 px-8 rounded-lg text-lg font-medium shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleSubmitAttendance}
                disabled={updateAttendanceLoading}
              >
                {updateAttendanceLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  attendanceDetails._id ? 'Update Attendance' : 'Submit Attendance'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create new attendance if none exists */}
      {!attendanceDetails && !attendanceLoading && formValues.classGroup && selectedDate && (
        <div className="bg-white shadow-lg rounded-xl p-6 mt-8 max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 3.5a3.5 3.5 0 01-4.95 4.95l-2.12-2.12a3.5 3.5 0 014.95-4.95l2.12 2.12z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Attendance Record Found</h3>
            <p className="text-gray-600 mb-6">There is no attendance record for this date. You can create one by submitting below.</p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-medium"
              onClick={handleSubmitAttendance}
              disabled={updateAttendanceLoading}
            >
              {updateAttendanceLoading ? 'Creating...' : 'Create New Attendance Record'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AddAttendance;