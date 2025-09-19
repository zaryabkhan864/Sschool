import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminLayout from '../layout/AdminLayout';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import { useGetCourseByGradeAndTeacherIDMutation } from '../../redux/api/courseApi';
import { useGetGradeByUserIdAndRoleMutation } from '../../redux/api/gradesApi';
import { useGetStudentsQuizDetailsByQuizDataMutation, useUpdateQuizMarksMutation } from '../../redux/api/quizApi';
import { useTranslation } from 'react-i18next';

const AddQuiz = () => {
    const { t } = useTranslation();
    const [userDetails, setUserDetails] = useState({});
    const [grades, setGrades] = useState([]);
    const [courses, setCourses] = useState([]);
    const [quizDetails, setQuizDetails] = useState(null);
    const [marks, setMarks] = useState({});
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

    const [formValues, setFormValues] = useState({
        grade: '',
        course: '',
        semester: '',
        quarter: '',
        quizNumber: '',
        user: '',
        campus: '',
        year: ''
    });

    const { user } = useSelector((state) => state.auth);

    // 1 get user details and set user field in formValues
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

    const [sendUserRoleAndID] = useGetGradeByUserIdAndRoleMutation();
    const [sendGradeAndTeacherID] = useGetCourseByGradeAndTeacherIDMutation();
    const [getQuizDetails] = useGetStudentsQuizDetailsByQuizDataMutation();
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
                userRole: userDetails.role
            };
            sendGradeAndTeacherID(body)
                .unwrap()
                .then((response) => {
                    setCourses(response.courses || []);
                })
                .catch((err) => console.error('Error fetching courses:', err));
        }
    }, [formValues.grade, userDetails.userId, sendGradeAndTeacherID, userDetails.role]);

    // Function to fetch quiz details
    const fetchQuizDetails = async () => {
        if (
          formValues.grade &&
          formValues.course &&
          formValues.semester &&
          formValues.quarter &&
          formValues.quizNumber &&
          formValues.user &&
          formValues.campus &&
          formValues.year
        ) {
          setIsLoadingQuiz(true);
          try {
            const selectedCourse = courses.find((item) => item._id === formValues.course);
                
            const quizData = {
                grade: formValues.grade,
                course: formValues.course,
                semester: formValues.semester,
                quarter: formValues.quarter,
                quizNumber: formValues.quizNumber,
                user: selectedCourse?.teacher || formValues.user,
                campus: formValues.campus,
                year: formValues.year // Make sure this is included
              };

              const response = await getQuizDetails(quizData).unwrap();

                setQuizDetails(response.quiz);
                // Initialize marks state with student IDs
                const initialMarks = {};
                response.quiz.marks.forEach(mark => {
                    initialMarks[mark.student] = {
                        ...mark,
                        studentName: mark.studentName // Ensure studentName is included
                    };
                });
                setMarks(initialMarks);
            } catch (err) {
                console.error('Error fetching quiz details:', err);
                toast.error('Failed to fetch quiz details.');
            } finally {
                setIsLoadingQuiz(false);
            }
        }
    };

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
        
        // Reset quiz details when any dropdown changes
        if (name !== 'quizNumber') {
            setQuizDetails(null);
            setMarks({});
        }
    };

    const handleMarkChange = (studentId, markIndex, value) => {
        setMarks(prevMarks => ({
            ...prevMarks,
            [studentId]: { 
                ...prevMarks[studentId], 
                [`question${markIndex}`]: parseInt(value) || 0 
            }
        }));
    };

    const handleSubmitMarks = async () => {
        try {
            // Convert marks object to array format expected by the API
            const marksArray = Object.keys(marks).map(studentId => ({
                student: studentId,
                question1: marks[studentId].question1 || 0,
                question2: marks[studentId].question2 || 0,
                question3: marks[studentId].question3 || 0,
                question4: marks[studentId].question4 || 0,
                question5: marks[studentId].question5 || 0,
            }));

            const payload = {
                quizId: quizDetails._id,
                marks: marksArray
            };
            
            await updateQuizMarks({ id: quizDetails._id, body: payload }).unwrap();
            toast.success('Marks submitted successfully!');
        } catch (err) {
            console.error('Error submitting marks:', err);
            toast.error('Failed to submit marks.');
        }
    };

    // Check if all required fields are selected to enable the fetch button
    const canFetchQuiz = formValues.grade && formValues.course && 
                        formValues.semester && formValues.quarter && 
                        formValues.quizNumber;

    return (
        <AdminLayout>
            <MetaData title={'Add Quiz Number'} />
            <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center mt-6">
                <select
                    className="w-1/5 border border-gray-300 p-2 rounded"
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

                <select
                    className="w-1/5 border border-gray-300 p-2 rounded"
                    name="course"
                    value={formValues.course}
                    onChange={handleDropdownChange}
                    disabled={!formValues.grade}
                >
                    <option value="">{t('Select Course')}</option>
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
                    <option value="">{t('Select Semester')}</option>
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
                    <option value="">{t('Select Quarter')}</option>
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
                    <option value="">{t('Select Quiz Number')}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                {canFetchQuiz && !quizDetails && (
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                        onClick={fetchQuizDetails}
                        disabled={isLoadingQuiz}
                    >
                        {isLoadingQuiz ? 'Loading...' : 'Fetch Quiz'}
                    </button>
                )}
            </div>

            {isLoadingQuiz && <Loader />}

            {quizDetails && !isLoadingQuiz && (
                <div className="overflow-x-auto mt-8">
                    <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">{t('Student Name')}</th>
                                <th className="py-2 px-4 border-b">{t('Mark')} 1</th>
                                <th className="py-2 px-4 border-b">{t('Mark')} 2</th>
                                <th className="py-2 px-4 border-b">{t('Mark')} 3</th>
                                <th className="py-2 px-4 border-b">{t('Mark')} 4</th>
                                <th className="py-2 px-4 border-b">{t('Mark')} 5</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(marks).map(([studentId, markData]) => (
                                <tr key={studentId}>
                                    <td className="py-2 px-4 border-b">{markData.studentName}</td>
                                    {[1, 2, 3, 4, 5].map((markIndex) => (
                                        <td className="py-2 px-4 border-b" key={markIndex}>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full p-1 border border-gray-300 rounded"
                                                value={markData[`question${markIndex}`] || 0}
                                                onChange={(e) => handleMarkChange(studentId, markIndex, e.target.value)}
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