import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useGetGradeByUserIdAndRoleMutation } from '../../../redux/api/gradesApi';
import { useGetCourseByGradeAndTeacherIDMutation } from '../../../redux/api/courseApi';
import { useGetStudentsExamDetailsByExamDataMutation, useUpdateExamMarksMutation } from '../../../redux/api/examApi';
import Loader from '../../layout/Loader';
import AdminLayout from '../../layout/AdminLayout';
import MetaData from '../../layout/MetaData';
import PrintLayout from '../../GUI/PrintLayout';

const ExamReport = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState({});
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [marks, setMarks] = useState({});
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const contentRef = useRef();

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

  // 1 get user details
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

  const [sendUserRoleAndID] = useGetGradeByUserIdAndRoleMutation();
  const [sendGradeAndTeacherID] = useGetCourseByGradeAndTeacherIDMutation();
  const [getExamDetails] = useGetStudentsExamDetailsByExamDataMutation();
  const [updateExamMarks, { isLoading: updateExamMarksLoading }] = useUpdateExamMarksMutation();

  // 2 get grades
  useEffect(() => {
    if (userDetails.userId && userDetails.userRole) {
      sendUserRoleAndID(userDetails)
        .unwrap()
        .then((response) => setGrades(response.grades || []))
        .catch((err) => console.error('API Error:', err));
    }
  }, [userDetails, sendUserRoleAndID]);

  // 3 get courses
  useEffect(() => {
    if (formValues.grade && userDetails.userId) {
      const body = {
        gradeId: formValues.grade,
        teacherId: userDetails.userId,
        userRole: userDetails.role,
      };
      sendGradeAndTeacherID(body)
        .unwrap()
        .then((response) => setCourses(response.courses || []))
        .catch((err) => console.error('Error fetching courses:', err));
    }
  }, [formValues.grade, userDetails.userId, sendGradeAndTeacherID, userDetails.role]);

  // 4 fetch exam details
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
          year: formValues.year,
        };

        const response = await getExamDetails(examData).unwrap();
        setExamDetails(response.exam);

        // initialize marks
        const initialMarks = {};
        response.exam.marks.forEach((mark) => {
          initialMarks[mark.student] = {
            ...mark,
            studentName: mark.studentName,
          };
        });
        setMarks(initialMarks);
      } catch (err) {
        console.error('Error fetching exam details:', err);
        toast.error('Failed to fetch exam details.');
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

    setExamDetails(null);
    setMarks({});
  };

  const calculateTotalMarks = (studentMarks) => {
    let total = 0;
    for (let i = 1; i <= 10; i++) {
      total += studentMarks[`question${i}`] || 0;
    }
    return total;
  };

  const canFetchExam =
    formValues.grade && formValues.course && formValues.semester && formValues.quarter;

  return (
    <AdminLayout>
      <MetaData title={'Exam Report'} />
      
      {/* Print/Export Buttons - Only show when exam details are available */}
      {examDetails && (
        <PrintLayout
          contentRef={contentRef} 
          documentName={`Exam_Report_S${formValues.semester}_Q${formValues.quarter}`}
        />
      )}

      <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center mt-6">
        {/* Dropdowns */}
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
        <div ref={contentRef} className="mt-10 bg-white p-6 rounded-lg shadow-md">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
            <div className="flex justify-center items-center mb-2">
              {/* School logo placeholder */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-blue-600">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">School Name</h1>
                <p className="text-gray-600">Official Exam Report</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <p><span className="font-semibold">Grade:</span> {grades.find(g => g._id === formValues.grade)?.gradeName}</p>
                <p><span className="font-semibold">Course:</span> {courses.find(c => c._id === formValues.course)?.courseName}</p>
              </div>
              <div className="text-right">
                <p><span className="font-semibold">Semester:</span> {formValues.semester}</p>
                <p><span className="font-semibold">Quarter:</span> {formValues.quarter}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Roll No</th>
                  <th className="border px-4 py-2">Student Name</th>
                  {[...Array(10)].map((_, i) => (
                    <th key={i} className="border px-4 py-2">Q{i + 1}</th>
                  ))}
                  <th className="border px-4 py-2 font-bold bg-blue-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(marks).map(([studentId, studentMarks], index) => (
                  <tr key={studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                    <td className="border px-4 py-2">{studentMarks.studentName}</td>
                    {[...Array(10)].map((_, i) => (
                      <td key={i} className="border px-4 py-2 text-center">
                        {studentMarks[`question${i + 1}`] || 0}
                      </td>
                    ))}
                    <td className="border px-4 py-2 text-center font-bold bg-blue-50">
                      {calculateTotalMarks(studentMarks)}
                    </td>
                  </tr>
                ))}
                {/* Summary Row */}
                <tr className="bg-gray-100 font-bold">
                  <td className="border px-4 py-2 text-center" colSpan="2">Summary</td>
                  {[...Array(10)].map((_, i) => (
                    <td key={i} className="border px-4 py-2 text-center">
                      {Object.values(marks).reduce((sum, m) => sum + (m[`question${i+1}`] || 0), 0)}
                    </td>
                  ))}
                  <td className="border px-4 py-2 text-center bg-blue-100">
                    {Object.values(marks).reduce((sum, m) => sum + calculateTotalMarks(m), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-100 p-3 rounded">
              <p><span className="font-semibold">Total Students:</span> {Object.keys(marks).length}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p><span className="font-semibold">Average Marks:</span> 
                {(Object.values(marks).reduce((acc, cur) => acc + calculateTotalMarks(cur), 0) / Object.keys(marks).length).toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p><span className="font-semibold">Highest Score:</span> 
                {Math.max(...Object.values(marks).map(m => calculateTotalMarks(m)))}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-8 border-t-2 border-gray-300 pt-6">
            <div className="text-center">
              <div className="border-b border-gray-300 inline-block pb-1 mb-2 font-semibold">Teacher's Signature</div>
              <p className="text-sm text-gray-600">{user?.name}</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 inline-block pb-1 mb-2 font-semibold">Principal's Signature</div>
              <p className="text-sm text-gray-600">School Principal</p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ExamReport;