import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';
import MetaData from '../layout/MetaData';
import { useGetGradeByUserIdAndRoleMutation, useGetGradeByUserIdAndRoleQuery, useGetGradesQuery } from '../../redux/api/gradesApi';
import { useGetCoursesQuery } from '../../redux/api/courseApi';
import { useAddQuizMarksMutation } from '../../redux/api/studentsApi';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const AddQuiz = () => {
    const params = useParams();
    const [userDetails, setUserDetails] = useState('');
    const [formValues, setFormValues] = useState({
        grade: '',
        course: '',
        semester: '',
        quarter: '',
        quizNumber: '',
    });

    const { isAuthenticated, user, loading: userLoading } = useSelector((state) => state.auth);

    const [sendUserRoleAndID, { isLoading: userRoleLoading, error, isSuccess }] =
        useGetGradeByUserIdAndRoleMutation();

    const { data: GradeData } = useGetGradesQuery();

    const { data: CourseData } = useGetCoursesQuery();
    const [addQuizMarks, { isLoading }] = useAddQuizMarksMutation();

    // Set user details when user data is available
    useEffect(() => {
        if (user) {
            setUserDetails({
                userId: user._id,
                userRole: user.role,
            });
        }
    }, [user]);

    useEffect(() => {
        if (userDetails.userId && userDetails.userRole) {
            sendUserRoleAndID(userDetails);
        }
    }, [userDetails, sendUserRoleAndID]);


    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === 'grade' && { course: '', semester: '', quarter: '', quizNumber: '' }), // Reset dependent fields
            ...(name === 'course' && { semester: '', quarter: '', quizNumber: '' }),
            ...(name === 'semester' && { quarter: '', quizNumber: '' }),
            ...(name === 'quarter' && { quizNumber: '' }),
        }));
    };

    const handleSubmit = () => {
        addQuizMarks(formValues);
    };

    // Button disable condition
    const isButtonDisabled = Object.values(formValues).some((value) => value === '');

    return (
        <AdminLayout>
            <MetaData title={'Add Quiz Number'} />
            <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center">
                {/* Grade Dropdown */}
                <select
                    className="w-1/6 border border-gray-300 p-2 rounded"
                    name="grade"
                    value={formValues.grade}
                    onChange={handleDropdownChange}
                >
                    <option value="">Select Grade</option>
                    {GradeData && GradeData?.grades?.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                            {grade.gradeName}
                        </option>
                    ))}
                </select>

                {/* Course Dropdown */}
                <select
                    className="w-1/6 border border-gray-300 p-2 rounded"
                    name="course"
                    value={formValues.course}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade}
                >
                    <option value="">Select Course</option>
                    {formValues.grade &&
                        CourseData?.courses?.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.courseName}
                            </option>
                        ))}
                </select>

                {/* Semester Dropdown */}
                <select
                    className="w-1/6 border border-gray-300 p-2 rounded"
                    name="semester"
                    value={formValues.semester}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade || !formValues.course}
                >
                    <option value="">Select Semester</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                {/* Quarter Dropdown */}
                <select
                    className="w-1/6 border border-gray-300 p-2 rounded"
                    name="quarter"
                    value={formValues.quarter}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade || !formValues.course || !formValues.semester}
                >
                    <option value="">Select Quarter</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                {/* Quiz Number Dropdown */}
                <select
                    className="w-1/6 border border-gray-300 p-2 rounded"
                    name="quizNumber"
                    value={formValues.quizNumber}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade || !formValues.course || !formValues.semester || !formValues.quarter}
                >
                    <option value="">Select Quiz Number</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                {/* Add Quiz Button */}
                <button
                    className={`bg-blue-500 text-white px-8 py-2 rounded ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                >
                    Add Quiz
                </button>
            </div>
        </AdminLayout>
    );
};

export default AddQuiz;
