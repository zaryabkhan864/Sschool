import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import AdminLayout from '../layout/AdminLayout';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';

import { useGetExamMarksMutation, useUpdateExamMarksMutation } from '../../redux/api/examApi.js';
import { useGetCourseByGradeAndTeacherIDMutation } from '../../redux/api/courseApi';
import { useGetGradeByUserIdAndRoleMutation } from '../../redux/api/gradesApi';

const AddExam = () => {
    const [userDetails, setUserDetails] = useState('');
    const [grades, setGrades] = useState([]);
    const [courses, setCourses] = useState([]);
    const [marks, setMarks] = useState({});
    const [examDetails, setExamDetails] = useState(null);
    
    const { user } = useSelector((state) => state.auth);

    const [formValues, setFormValues] = useState({
        grade: '',
        course: '',
        semester: '',
        quarter: '',
        user: '', 
    });


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
    const [updateExamMarks, { isLoading: updateExamMarksLoading }] = useUpdateExamMarksMutation();
    const [getExamMarks, { isLoading: examMarksLoading }] = useGetExamMarksMutation();

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


     // Function to fetch quiz details
     const fetchExamDetails = async () => {
        if (
            formValues.grade &&
            formValues.course &&
            formValues.semester &&
            formValues.quarter
        ) {
            try {
                const response = await getExamMarks(formValues).unwrap();
                console.log("Exam details response:", response);
                setExamDetails(response.exam);
                // Initialize marks state with student IDs
                const initialMarks = {};
                response.exam.marks.forEach(mark => {
                    initialMarks[mark.student] = mark;
                });
                setMarks(initialMarks);
            } catch (err) {
                console.error('Error fetching exam details:', err);
            }
        }
    };

    useEffect(() => {
        fetchExamDetails();
    }, [formValues]); // Re-run whenever formValues changes

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === 'grade' && { course: '', semester: '', quarter: '',  }),
            ...(name === 'course' && { semester: '', quarter: '',  }),
            ...(name === 'semester' && { quarter: '',  }),
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
                quizId: examDetails._id,
                marks: Object.values(marks)
            };
            await updateExamMarks({ id: examDetails._id, body: payload })
            toast.success('Exam marks submitted successfully!');
        } catch (err) {
            console.error('Error submitting marks:', err);
            toast.error('Failed to submit marks.');
        }
    };

    return (
        <AdminLayout>
            <MetaData title={'Add Exam Number'} />
            <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center mt-6">
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
            </div>
            {!examDetails && examMarksLoading && (<Loader/>)}

            {examDetails && !examMarksLoading && (
                <div className="overflow-x-auto mt-8">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Student Name</th>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((markIndex) => (
                                <th className="py-2 px-4 border-b" key={markIndex}>Mark {markIndex}</th>
                            ))}
                               
                            </tr>
                        </thead>
                        <tbody>
                        {Object.entries(marks).map(([key, value]) => (
                                <tr key={key}>
                                    <td className="py-2 px-4 border-b">{value.studentName}</td>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((markIndex) => (
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
                            disabled={updateExamMarksLoading}
                        >
                            {updateExamMarksLoading ? 'Submitting...' : 'Submit Marks'}
                        </button>
                    )}
                </div>
            )}
        </AdminLayout>
    );
};

export default AddExam;