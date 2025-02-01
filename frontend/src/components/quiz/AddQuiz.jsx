import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import AdminLayout from '../layout/AdminLayout';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';

import { useGetStudentsQuizDetailsByQuizDataMutation } from '../../redux/api/studentsApi';
import { useGetCourseByGradeAndTeacherIDMutation } from '../../redux/api/courseApi';
import { useGetGradeByUserIdAndRoleMutation } from '../../redux/api/gradesApi';
import { useUpdateQuizMarksMutation } from '../../redux/api/quizApi';

const AddQuiz = () => {
    const [userDetails, setUserDetails] = useState('');
    const [grades, setGrades] = useState([]);
    const [courses, setCourses] = useState([]);
    const [quizDetails, setQuizDetails] = useState(null);
    const [marks, setMarks] = useState({});

    const [formValues, setFormValues] = useState({
        grade: '',
        course: '',
        semester: '',
        quarter: '',
        quizNumber: '',
        user: '', // Add user field here
    });

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // 1 get user details and set user field in formValues
    useEffect(() => {
        if (user && user._id) {
            setFormValues((prevFormValues) => ({
                ...prevFormValues,
                user: user._id, // Update user field in formValues
            }));
            setUserDetails({
                userId: user._id,
                userRole: user.role,
            });
        }
    }, [user]); // Run this effect when user changes

    const [sendUserRoleAndID] = useGetGradeByUserIdAndRoleMutation();
    const [sendGradeAndTeacherID] = useGetCourseByGradeAndTeacherIDMutation();
    // const [addQuizMarks] = useAddQuizMarksMutation();
    const [updateQuizMarks, { isLoading: updateQuizMarksLoading }] = useUpdateQuizMarksMutation();

    // 2 get grades based on user role and id and get user grade 
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

    useEffect(() => {
        if (formValues.grade && userDetails.userId) {
            const body = {
                gradeId: formValues.grade,
                teacherId: userDetails.userId,
            };
            sendGradeAndTeacherID(body)
                .unwrap()
                .then((response) => {
                    setCourses(response.courses || []);
                })
                .catch((err) => console.error('Error fetching courses:', err));
        }
    }, [formValues.grade, userDetails.userId, sendGradeAndTeacherID]);

    const [getQuizDetails, { isLoading, error }] = useGetStudentsQuizDetailsByQuizDataMutation();

    // Function to fetch quiz details
    const fetchQuizDetails = async () => {
        if (
            formValues.grade &&
            formValues.course &&
            formValues.semester &&
            formValues.quarter &&
            formValues.quizNumber
        ) {
            try {
                const response = await getQuizDetails(formValues).unwrap();
                console.log("Quiz details response:", response);
                setQuizDetails(response.quiz);
                // Initialize marks state with student IDs
                const initialMarks = {};
                response.quiz.marks.forEach(mark => {
                    initialMarks[mark.student] = mark;
                });
                setMarks(initialMarks);
            } catch (err) {
                console.error('Error fetching quiz details:', err);
            }
        }
    };

    useEffect(() => {
        fetchQuizDetails();
    }, [formValues]); // Re-run whenever formValues changes

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === 'grade' && { course: '', semester: '', quarter: '', quizNumber: '' }),
            ...(name === 'course' && { semester: '', quarter: '', quizNumber: '' }),
            ...(name === 'semester' && { quarter: '', quizNumber: '' }),
            ...(name === 'quarter' && { quizNumber: '' }),
        }));
    };

    const handleMarkChange = (studentId, markIndex, value) => {
        setMarks(prevMarks => ({
            ...prevMarks,
            [studentId]: {...prevMarks[studentId], [`question${markIndex}`]: value}
        }));
    };

    const handleSubmitMarks = async () => {
        try {
            const payload = {
                quizId: quizDetails._id,
                marks: Object.values(marks)
            };
            await updateQuizMarks({ id: quizDetails._id, body: payload })
            toast.success('Marks submitted successfully!');
        } catch (err) {
            console.error('Error submitting marks:', err);
            toast.error('Failed to submit marks.');
        }
    };

    return (
        <AdminLayout>
            <MetaData title={'Add Quiz Number'} />
            <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center">
                <select
                    className="w-1/5 border border-gray-300 p-2 rounded"
                    name="grade"
                    value={formValues.grade}
                    onChange={handleDropdownChange}
                >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                            {grade.gradeName}
                        </option>
                    ))}
                </select>

                <select
                    className="w-1/5 border border-gray-300 p-2 rounded"
                    name="course"
                    value={formValues.course}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade}
                >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                            {course.courseName}
                        </option>
                    ))}
                </select>

                <select
                    className="w-1/5 border border-gray-300 p-2 rounded"
                    name="semester"
                    value={formValues.semester}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade || !formValues.course}
                >
                    <option value="">Select Semester</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                <select
                    className="w-1/5 border border-gray-300 p-2 rounded"
                    name="quarter"
                    value={formValues.quarter}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade || !formValues.course || !formValues.semester}
                >
                    <option value="">Select Quarter</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

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
            </div>

            {!quizDetails && isLoading && (<Loader/>)}


            {quizDetails && !isLoading && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Student Name</th>
                                <th className="py-2 px-4 border-b">Mark 1</th>
                                <th className="py-2 px-4 border-b">Mark 2</th>
                                <th className="py-2 px-4 border-b">Mark 3</th>
                                <th className="py-2 px-4 border-b">Mark 4</th>
                                <th className="py-2 px-4 border-b">Mark 5</th>
                            </tr>
                        </thead>
                        <tbody>
                        {Object.entries(marks).map(([key, value]) => (
                                <tr key={key}>
                                    <td className="py-2 px-4 border-b">{value.studentName}</td>
                                    {[1, 2, 3, 4, 5].map((markIndex) => (
                                        <td className="py-2 px-4 border-b" key={markIndex}>
                                            <input
                                                type="number"
                                                className="w-full p-1 border border-gray-300 rounded"
                                                value={value[`question${markIndex}`]}
                                                onChange={(e) => handleMarkChange(key, markIndex, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {Object.keys(marks).length > 0 && (
                        <button
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                            onClick={handleSubmitMarks}
                            disabled={updateQuizMarksLoading}
                        >
                            {updateQuizMarksLoading ? 'Submitting...' : 'Submit Marks'}
                        </button>
                    )}
                </div>
            )}
        </AdminLayout>
    );
};

export default AddQuiz;