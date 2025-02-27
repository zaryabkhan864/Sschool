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
    console.log("What is get Attendance",getAttendance);
    console.log("What is update attendance",updateAttendance)

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
                response.attendance.records.forEach(record => {
                    initialAttendance[record.student] = record;
                });
                setAttendance(initialAttendance);
            } catch (err) {
                console.error('Error fetching attendance details:', err);
            }
        }
    };

    useEffect(() => {
        fetchAttendanceDetails();
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
            await updateAttendance({ id: attendanceDetails._id, body: payload });
            toast.success('Attendance submitted successfully!');
        } catch (err) {
            console.error('Error submitting attendance:', err);
            toast.error('Failed to submit attendance.');
        }
    };

    return (
        <AdminLayout>
            <MetaData title={'Add Attendance'} />
            <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center mt-6">
                <select
                    className="w-1/4 border border-gray-300 p-3 rounded-lg text-lg"
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
                    className="w-1/4 border border-gray-300 p-3 rounded-lg text-lg"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {!attendanceDetails && attendanceLoading && <Loader />}

            {attendanceDetails && !attendanceLoading && (
                <div className="overflow-x-auto mt-8">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">{t('Student Name')}</th>
                                <th className="py-2 px-4 border-b">{t('Status')}</th>
                                <th className="py-2 px-4 border-b">{t('Remarks')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(attendance).map(([key, value]) => (
                                <tr key={key}>
                                    <td className="py-2 px-4 border-b">{value.studentName}</td>
                                    <td className="py-2 px-4 border-b">
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded text-lg"
                                            value={value.status}
                                            onChange={(e) => setAttendance(prevAttendance => ({
                                                ...prevAttendance,
                                                [key]: { ...prevAttendance[key], status: e.target.value }
                                            }))}
                                        >
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                            <option value="late">Late</option>
                                            <option value="half-day">Half-day</option>
                                        </select>
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded text-lg"
                                            value={value.remarks}
                                            onChange={(e) => setAttendance(prevAttendance => ({
                                                ...prevAttendance,
                                                [key]: { ...prevAttendance[key], remarks: e.target.value }
                                            }))}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {Object.keys(attendance).length > 0 && (
                        <button
                            className="mt-4 bg-blue-500 text-white py-3 px-6 rounded-lg text-lg"
                            onClick={handleSubmitAttendance}
                            disabled={updateAttendanceLoading}
                        >
                            {updateAttendanceLoading ? 'Submitting...' : 'Submit Attendance'}
                        </button>
                    )}
                </div>
            )}
        </AdminLayout>
    );
};

export default AddAttendance;
