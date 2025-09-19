import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminLayout from '../layout/AdminLayout';
import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';
import { useGetCourseByGradeAndTeacherIDMutation } from '../../redux/api/courseApi';
import { useGetGradeByUserIdAndRoleMutation } from '../../redux/api/gradesApi';
import { useGetStudentsExamDetailsByExamDataMutation, useUpdateExamMarksMutation } from '../../redux/api/examApi';
import { useTranslation } from 'react-i18next';

const AddExam = () => {
    const { t } = useTranslation();
    const [userDetails, setUserDetails] = useState({});
    const [grades, setGrades] = useState([]);
    const [courses, setCourses] = useState([]);
    const [examDetails, setExamDetails] = useState(null);
    const [marks, setMarks] = useState({});
    const [isLoadingExam, setIsLoadingExam] = useState(false);

    const [formValues, setFormValues] = useState({
        grade: '',
        course: '',
        semester: '',
        quarter: '',
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
    const [getExamDetails] = useGetStudentsExamDetailsByExamDataMutation();
    const [updateExamMarks, { isLoading: updateExamMarksLoading }] = useUpdateExamMarksMutation();

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

    // Function to fetch exam details
    const fetchExamDetails = async () => {
        if (
          formValues.grade &&
          formValues.course &&
          formValues.semester &&
          formValues.quarter &&
          formValues.user &&
          formValues.campus &&
          formValues.year
        ) {
          setIsLoadingExam(true);
          try {
            const selectedCourse = courses.find((item) => item._id === formValues.course);
                
            const examData = {
                grade: formValues.grade,
                course: formValues.course,
                semester: formValues.semester,
                quarter: formValues.quarter,
                user: selectedCourse?.teacher || formValues.user,
                campus: formValues.campus,
                year: formValues.year
              };
    
              const response = await getExamDetails(examData).unwrap();
    
              if (response.exam) {
                  setExamDetails(response.exam);
                  // Initialize marks state with student IDs
                  const initialMarks = {};
                  response.exam.marks.forEach(mark => {
                      initialMarks[mark.student] = {
                          ...mark,
                          studentName: mark.studentName // Ensure studentName is included
                      };
                  });
                  setMarks(initialMarks);
              } else {
                  // No exam found - you might want to create one or show a message
                  toast.error('No exam found for the selected criteria.');
                  setExamDetails(null);
                  setMarks({});
              }
          } catch (err) {
              console.error('Error fetching exam details:', err);
              // Check if it's a "not found" error vs other error
              if (err.status === 404) {
                  toast.error('No exam found for the selected criteria.');
              } else {
                  toast.error('Failed to fetch exam details.');
              }
              setExamDetails(null);
              setMarks({});
          } finally {
              setIsLoadingExam(false);
          }
        }
    };

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === 'grade' && { course: '', semester: '', quarter: '' }),
            ...(name === 'course' && { semester: '', quarter: '' }),
            ...(name === 'semester' && { quarter: '' }),
        }));
        
        // Reset exam details when any dropdown changes
        setExamDetails(null);
        setMarks({});
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
            const marksArray = Object.keys(marks).map(studentId => {
                const markObj = {
                    student: studentId
                };
                
                // Add all 10 questions
                for (let i = 1; i <= 10; i++) {
                    markObj[`question${i}`] = marks[studentId][`question${i}`] || 0;
                }
                
                return markObj;
            });

            const payload = {
                examId: examDetails._id,
                marks: marksArray
            };
            
            await updateExamMarks({ id: examDetails._id, body: payload }).unwrap();
            toast.success('Exam marks submitted successfully!');
        } catch (err) {
            console.error('Error submitting marks:', err);
            toast.error('Failed to submit marks.');
        }
    };

    // Check if all required fields are selected to enable the fetch button
    const canFetchExam = formValues.grade && formValues.course && 
                        formValues.semester && formValues.quarter;

    return (
        <AdminLayout>
            <MetaData title={'Add Exam Marks'} />
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

                {canFetchExam && !examDetails && (
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                        onClick={fetchExamDetails}
                        disabled={isLoadingExam}
                    >
                        {isLoadingExam ? 'Loading...' : 'Fetch Exam'}
                    </button>
                )}
            </div>

            {isLoadingExam && <Loader />}

            {examDetails && !isLoadingExam && (
                <div className="overflow-x-auto mt-8">
                    <h2 className="text-xl font-bold mb-4">Exam Details</h2>
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">{t('Student Name')}</th>
                                {[...Array(10)].map((_, index) => (
                                    <th key={index} className="py-2 px-4 border-b">
                                        {t('Question')} {index + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(marks).map(([studentId, markData]) => (
                                <tr key={studentId}>
                                    <td className="py-2 px-4 border-b">{markData.studentName}</td>
                                    {[...Array(10)].map((_, index) => (
                                        <td className="py-2 px-4 border-b" key={index}>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full p-1 border border-gray-300 rounded"
                                                value={markData[`question${index + 1}`] || 0}
                                                onChange={(e) => handleMarkChange(studentId, index + 1, e.target.value)}
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