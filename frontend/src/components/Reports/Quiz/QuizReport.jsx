import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import {
  useGetStudentsQuizDetailsByQuizDataMutation,
  useUpdateQuizMarksMutation,
} from '../../../redux/api/quizApi';
import Loader from '../../layout/Loader';
import MetaData from '../../layout/MetaData';
import PrintLayout from '../../GUI/PrintLayout';
import AdminLayout from '../../GUI/AdminLayout';
import { useGetCoursesByRoleQuery } from '../../../redux/api/courseApi';




const QuizReport = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState({});
  const [classGroups, setClassGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [marks, setMarks] = useState({});
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const contentRef = useRef();

  const [formValues, setFormValues] = useState({
    classGroup: '',
    course: '',
    semester: '',
    quarter: '',
    quizNumber: '',
    user: '',
    campus: '',
    year: '',
  });

  const { user } = useSelector((state) => state.auth);

  // 1. Get user details and set user field in formValues
  useEffect(() => {
    if (user && user._id) {
      const campusFromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('campus='))
        ?.split('=')[1];

      const yearFromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('selectedYear='))
        ?.split('=')[1];

      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        user: user._id,
        campus: campusFromCookie,
        year: Number(yearFromCookie),
      }));

      setUserDetails({
        userId: user._id,
        userRole: user.role,
      });
    }
  }, [user]);

  // 2. Get class groups and courses based on user role (NOW WORKS ✅)
  const {
    data: roleData,
    isLoading: roleLoading,
    refetch: refetchRoleData,
  } = useGetCoursesByRoleQuery(
    {
      userId: userDetails.userId,
      userRole: userDetails.userRole,
    },
    {
      skip: !userDetails.userId || !userDetails.userRole,
      refetchOnMountOrArgChange: true,
    }
  );

  // 3. Process role data when it loads
  useEffect(() => {
    if (roleData) {
      const allClassGroups = roleData.classGroups || [];
      setClassGroups(allClassGroups);

      const allCourses = roleData.courses || [];
      setCourses(allCourses);

      if (formValues.classGroup && allClassGroups.length > 0) {
        const selectedClassGroup = allClassGroups.find(
          (group) => group._id === formValues.classGroup
        );
        if (selectedClassGroup && selectedClassGroup.courses) {
          setFilteredCourses(selectedClassGroup.courses);
        } else {
          setFilteredCourses([]);
        }
      } else {
        setFilteredCourses(allCourses);
      }
    }
  }, [roleData, formValues.classGroup]);

  // 4. Reset courses when class group changes
  useEffect(() => {
    if (formValues.classGroup && classGroups.length > 0) {
      const selectedClassGroup = classGroups.find(
        (group) => group._id === formValues.classGroup
      );
      if (selectedClassGroup && selectedClassGroup.courses) {
        setFilteredCourses(selectedClassGroup.courses);
      } else {
        setFilteredCourses([]);
      }
      setFormValues((prev) => ({
        ...prev,
        course: '',
        semester: '',
        quarter: '',
        quizNumber: '',
      }));
    } else {
      setFilteredCourses(courses);
    }
  }, [formValues.classGroup, classGroups, courses]);

  const [getQuizDetails] = useGetStudentsQuizDetailsByQuizDataMutation();
  const [updateQuizMarks, { isLoading: updateQuizMarksLoading }] =
    useUpdateQuizMarksMutation();

  // Function to fetch quiz details
  const fetchQuizDetails = async () => {
    if (
      formValues.classGroup &&
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
        const selectedCourse = filteredCourses.find(
          (item) => item._id === formValues.course
        );

        const selectedClassGroup = classGroups.find(
          (group) => group._id === formValues.classGroup
        );

        const quizData = {
          grade: selectedClassGroup?.grade?._id || formValues.classGroup,
          classGroup: formValues.classGroup,
          course: formValues.course,
          semester: formValues.semester,
          quarter: formValues.quarter,
          quizNumber: formValues.quizNumber,
          user: selectedCourse?.teacher || formValues.user,
          campus: formValues.campus,
          year: formValues.year,
        };

        const response = await getQuizDetails(quizData).unwrap();

        setQuizDetails(response.quiz);
        const initialMarks = {};
        response.quiz.marks.forEach((mark) => {
          initialMarks[mark.student] = {
            ...mark,
            studentName: mark.studentName,
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
      ...(name === 'classGroup' && {
        course: '',
        semester: '',
        quarter: '',
        quizNumber: '',
      }),
      ...(name === 'course' && { semester: '', quarter: '', quizNumber: '' }),
      ...(name === 'semester' && { quarter: '', quizNumber: '' }),
      ...(name === 'quarter' && { quizNumber: '' }),
    }));

    if (name !== 'quizNumber') {
      setQuizDetails(null);
      setMarks({});
    }
  };

  const handleMarkChange = (studentId, markIndex, value) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: {
        ...prevMarks[studentId],
        [`question${markIndex}`]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmitMarks = async () => {
    if (!quizDetails) {
      toast.error('No quiz selected');
      return;
    }

    try {
      const marksArray = Object.keys(marks).map((studentId) => ({
        student: studentId,
        question1: marks[studentId].question1 || 0,
        question2: marks[studentId].question2 || 0,
        question3: marks[studentId].question3 || 0,
        question4: marks[studentId].question4 || 0,
        question5: marks[studentId].question5 || 0,
      }));

      const payload = {
        quizId: quizDetails._id,
        marks: marksArray,
      };

      await updateQuizMarks({ id: quizDetails._id, body: payload }).unwrap();
      toast.success('Marks submitted successfully!');
    } catch (err) {
      console.error('Error submitting marks:', err);
      toast.error('Failed to submit marks.');
    }
  };

  const canFetchQuiz =
    formValues.classGroup &&
    formValues.course &&
    formValues.semester &&
    formValues.quarter &&
    formValues.quizNumber;

  const calculateTotalMarks = (studentMarks) => {
    return (
      (studentMarks.question1 || 0) +
      (studentMarks.question2 || 0) +
      (studentMarks.question3 || 0) +
      (studentMarks.question4 || 0) +
      (studentMarks.question5 || 0)
    );
  };

  const getClassGroupDisplay = (classGroup) => {
    if (!classGroup) return '';
    if (classGroup.displayName) {
      return classGroup.displayName;
    }
    const gradeName = classGroup.grade?.gradeName || 'Grade';
    return `${gradeName} - ${classGroup.section}`;
  };

  const selectedClassGroup = classGroups.find(
    (g) => g._id === formValues.classGroup
  );
  const selectedCourse = filteredCourses.find(
    (c) => c._id === formValues.course
  );

  return (
    <AdminLayout>
      <MetaData title={'Add Quiz Number'} />

      {quizDetails && (
        <PrintLayout
          contentRef={contentRef}
          documentName={`Quiz_${formValues.quizNumber}_Report`}
        />
      )}

      {roleLoading && <Loader />}

      <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center mt-6">
        <select
          className="w-1/5 border border-gray-300 p-2 rounded"
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

        <select
          className="w-1/5 border border-gray-300 p-2 rounded"
          name="course"
          value={formValues.course}
          onChange={handleDropdownChange}
          disabled={!formValues.classGroup || filteredCourses.length === 0}
        >
          <option value="">{t('Select Course')}</option>
          {filteredCourses.map((course) => (
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
          disabled={!formValues.classGroup || !formValues.course}
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
          disabled={
            !formValues.classGroup || !formValues.course || !formValues.semester
          }
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
          disabled={
            !formValues.classGroup ||
            !formValues.course ||
            !formValues.semester ||
            !formValues.quarter
          }
        >
          <option value="">{t('Select Quiz Number')}</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>

        {canFetchQuiz && !quizDetails && (
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={fetchQuizDetails}
            disabled={isLoadingQuiz || roleLoading}
          >
            {isLoadingQuiz ? 'Loading...' : 'Fetch Quiz'}
          </button>
        )}
      </div>

      {!roleLoading && classGroups.length === 0 && (
        <div className="mt-6 text-center text-gray-500">
          <p>No class groups or courses assigned to you.</p>
        </div>
      )}

      {isLoadingQuiz && <Loader />}

      {quizDetails && !isLoadingQuiz && (
        <div ref={contentRef} className="mt-10 bg-white p-6 rounded-lg shadow-md">
          {/* School Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
            <div className="flex justify-center items-center mb-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-blue-600">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">School Name</h1>
                <p className="text-gray-600">Official Quiz Report</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <p>
                  <span className="font-semibold">Class/Section:</span>{' '}
                  {getClassGroupDisplay(selectedClassGroup)}
                </p>
                <p>
                  <span className="font-semibold">Course:</span>{' '}
                  {selectedCourse?.courseName || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <span className="font-semibold">Semester:</span>{' '}
                  {formValues.semester}
                </p>
                <p>
                  <span className="font-semibold">Quarter:</span>{' '}
                  {formValues.quarter}, Quiz {formValues.quizNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Student Marks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Roll No</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Student Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Q1</th>
                  <th className="border border-gray-300 px-4 py-2">Q2</th>
                  <th className="border border-gray-300 px-4 py-2">Q3</th>
                  <th className="border border-gray-300 px-4 py-2">Q4</th>
                  <th className="border border-gray-300 px-4 py-2">Q5</th>
                  <th className="border border-gray-300 px-4 py-2 font-bold bg-blue-50">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(marks).map(([studentId, studentMarks], index) => (
                  <tr
                    key={studentId}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {studentMarks.studentName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {studentMarks.question1 || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {studentMarks.question2 || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {studentMarks.question3 || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {studentMarks.question4 || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {studentMarks.question5 || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold bg-blue-50">
                      {calculateTotalMarks(studentMarks)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td
                    className="border border-gray-300 px-4 py-2 text-center"
                    colSpan="2"
                  >
                    Summary
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {Object.values(marks).reduce(
                      (sum, m) => sum + (m.question1 || 0),
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {Object.values(marks).reduce(
                      (sum, m) => sum + (m.question2 || 0),
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {Object.values(marks).reduce(
                      (sum, m) => sum + (m.question3 || 0),
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {Object.values(marks).reduce(
                      (sum, m) => sum + (m.question4 || 0),
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {Object.values(marks).reduce(
                      (sum, m) => sum + (m.question5 || 0),
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center bg-blue-100">
                    {Object.values(marks).reduce(
                      (sum, m) => sum + calculateTotalMarks(m),
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statistics Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-100 p-3 rounded">
              <p>
                <span className="font-semibold">Total Students:</span>{' '}
                {Object.keys(marks).length}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p>
                <span className="font-semibold">Average Marks:</span>
                {Object.keys(marks).length > 0
                  ? (
                      Object.values(marks).reduce(
                        (acc, cur) => acc + calculateTotalMarks(cur),
                        0
                      ) / Object.keys(marks).length
                    ).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p>
                <span className="font-semibold">Highest Score:</span>
                {Object.keys(marks).length > 0
                  ? Math.max(
                      ...Object.values(marks).map((m) => calculateTotalMarks(m))
                    )
                  : 0}
              </p>
            </div>
          </div>

          {/* Edit Marks Section (for teachers) */}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <div className="mt-8 border-t border-gray-300 pt-6">
              <h3 className="text-lg font-bold mb-4">Edit Marks</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2">
                        Student Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2">Q1</th>
                      <th className="border border-gray-300 px-4 py-2">Q2</th>
                      <th className="border border-gray-300 px-4 py-2">Q3</th>
                      <th className="border border-gray-300 px-4 py-2">Q4</th>
                      <th className="border border-gray-300 px-4 py-2">Q5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(marks).map(([studentId, studentMarks]) => (
                      <tr key={studentId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {studentMarks.studentName}
                        </td>
                        {[1, 2, 3, 4, 5].map((questionNum) => (
                          <td
                            className="border border-gray-300 px-4 py-2"
                            key={questionNum}
                          >
                            <input
                              type="number"
                              min="0"
                              max="20"
                              className="w-20 p-1 border border-gray-300 rounded text-center"
                              value={studentMarks[`question${questionNum}`] || 0}
                              onChange={(e) =>
                                handleMarkChange(
                                  studentId,
                                  questionNum,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                  <button
                    className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    onClick={handleSubmitMarks}
                    disabled={
                      updateQuizMarksLoading || Object.keys(marks).length === 0
                    }
                  >
                    {updateQuizMarksLoading ? 'Updating...' : 'Update Marks'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="mt-10 grid grid-cols-2 gap-8 border-t-2 border-gray-300 pt-6">
            <div className="text-center">
              <div className="border-b border-gray-300 inline-block pb-1 mb-2 font-semibold">
                Teacher's Signature
              </div>
              <p className="text-sm text-gray-600">{user?.name}</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 inline-block pb-1 mb-2 font-semibold">
                Principal's Signature
              </div>
              <p className="text-sm text-gray-600">School Principal</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default QuizReport;