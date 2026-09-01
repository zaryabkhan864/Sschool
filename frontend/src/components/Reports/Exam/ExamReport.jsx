// components/Reports/Exam/ExamReport.jsx
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useGetExamDetailsQuery } from "../../../redux/api/examApi";
import Loader from "../../layout/Loader";
import MetaData from "../../layout/MetaData";
import PrintLayout from "../../GUI/PrintLayout";
import AdminLayout from "../../layout/AdminLayout";

const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

// ✅ REWRITTEN: the old version fetched grades via useLazyGetGradesQuery
// + courses via useGetCourseByGradeAndTeacherIDMutation, used
// semester/quarter, and parsed campus/academicYear from
// `document.cookie` directly. Exams are now classGroup-based (same as
// Quiz) with a teacher-configurable question count, and campus/
// academicYear are resolved server-side — this just fetches one exam by
// id and renders however many question columns it actually has.
const ExamReport = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const contentRef = useRef();
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, error } = useGetExamDetailsQuery(id);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading exam"));
  }, [error, t]);

  if (isLoading) return <Loader />;

  const exam = data?.exam;
  if (!exam) return null;

  const questionIndexes = Array.from({ length: exam.totalQuestions }, (_, i) => i);

  const rowTotal = (answers) => (answers || []).reduce((sum, v) => sum + v, 0);
  const columnTotal = (qIndex) => exam.marks.reduce((sum, m) => sum + (m.answers?.[qIndex] || 0), 0);
  const grandTotal = exam.marks.reduce((sum, m) => sum + rowTotal(m.answers), 0);
  const average = exam.marks.length ? (grandTotal / exam.marks.length).toFixed(2) : "0.00";
  const highest = exam.marks.length ? Math.max(...exam.marks.map((m) => rowTotal(m.answers))) : 0;

  return (
    <AdminLayout>
      <MetaData title={t("Exam Report")} />

      <PrintLayout contentRef={contentRef} documentName={`Exam_${exam.examNumber}_Report`} />

      <div ref={contentRef} className="mt-6 bg-white p-6 rounded-lg shadow-md">
        {/* School Header */}
        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
          <div className="flex justify-center items-center mb-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-blue-600">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("School Name")}</h1>
              <p className="text-gray-600">{t("Official Exam Report")}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <p>
                <span className="font-semibold">{t("Class/Section")}:</span> {exam.classGroup?.displayName}
              </p>
              <p>
                <span className="font-semibold">{t("Course")}:</span> {exam.course?.courseName}
              </p>
            </div>
            <div className="text-right">
              <p>
                <span className="font-semibold">{t("Exam")}:</span> {exam.title} (#{exam.examNumber})
              </p>
              <p>
                <span className="font-semibold">{t("Date")}:</span> {new Date(exam.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Student Marks Table — dynamic Q1..Qn */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">{t("Student Name")}</th>
                {questionIndexes.map((i) => (
                  <th key={i} className="border border-gray-300 px-4 py-2">
                    Q{i + 1}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 font-bold bg-blue-50">{t("Total")}</th>
              </tr>
            </thead>
            <tbody>
              {exam.marks.map((mark, index) => (
                <tr key={mark.student?._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{getFullName(mark.student)}</td>
                  {questionIndexes.map((i) => (
                    <td key={i} className="border border-gray-300 px-4 py-2 text-center">
                      {mark.answers?.[i] ?? 0}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold bg-blue-50">
                    {rowTotal(mark.answers)} / {exam.totalMarks}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-4 py-2 text-center" colSpan="2">
                  {t("Summary")}
                </td>
                {questionIndexes.map((i) => (
                  <td key={i} className="border border-gray-300 px-4 py-2 text-center">
                    {columnTotal(i)}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-center bg-blue-100">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-100 p-3 rounded">
            <p>
              <span className="font-semibold">{t("Total Students")}:</span> {exam.marks.length}
            </p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p>
              <span className="font-semibold">{t("Average Marks")}:</span> {average}
            </p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p>
              <span className="font-semibold">{t("Highest Score")}:</span> {highest}
            </p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-10 grid grid-cols-2 gap-8 border-t-2 border-gray-300 pt-6">
          <div className="text-center">
            <div className="border-b border-gray-300 inline-block pb-1 mb-2 font-semibold">
              {t("Teacher's Signature")}
            </div>
            <p className="text-sm text-gray-600">{getFullName(exam.teacher) || user?.email}</p>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-300 inline-block pb-1 mb-2 font-semibold">
              {t("Principle's Signature")}
            </div>
            <p className="text-sm text-gray-600">{t("School Principle")}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ExamReport;
