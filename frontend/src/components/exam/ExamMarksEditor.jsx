// components/exam/ExamMarksEditor.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetExamDetailsQuery, useUpdateExamMarksMutation, useDeleteExamMutation } from "../../redux/api/examApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";

const getFullName = (user) => {
  if (!user) return "";
  const { firstName = "", middleName = "", lastName = "" } = user;
  return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
};

const ExamMarksEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useGetExamDetailsQuery(id);
  const [updateExamMarks, { isLoading: isSaving, error: saveError, isSuccess }] = useUpdateExamMarksMutation();
  const [deleteExam, { isLoading: isDeleting, isSuccess: deleteSuccess, error: deleteError }] =
    useDeleteExamMutation();

  const [marks, setMarks] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading exam"));
  }, [error, t]);

  useEffect(() => {
    if (saveError) toast.error(saveError?.data?.message || t("Failed to save marks"));
    if (isSuccess) toast.success(t("Marks saved"));
  }, [saveError, isSuccess, t]);

  useEffect(() => {
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete exam"));
    if (deleteSuccess) {
      toast.success(t("Exam deleted"));
      navigate("/teacher/exams");
    }
  }, [deleteError, deleteSuccess, navigate, t]);

  const exam = data?.exam;

  useEffect(() => {
    if (exam?.marks) {
      const initial = {};
      exam.marks.forEach((m) => {
        initial[m.student._id || m.student] = [...(m.answers || [])];
      });
      setMarks(initial);
    }
  }, [exam]);

  const questionIndexes = useMemo(
    () => (exam ? Array.from({ length: exam.totalQuestions }, (_, i) => i) : []),
    [exam]
  );

  const handleAnswerChange = (studentId, qIndex, value) => {
    const numeric = Math.max(0, Math.min(exam.marksPerQuestion, Number(value) || 0));
    setMarks((prev) => ({
      ...prev,
      [studentId]: prev[studentId].map((v, i) => (i === qIndex ? numeric : v)),
    }));
  };

  const rowTotal = (studentId) => (marks[studentId] || []).reduce((sum, v) => sum + v, 0);

  const stats = useMemo(() => {
    const totals = Object.keys(marks).map((sid) => rowTotal(sid));
    if (!totals.length) return null;
    const average = totals.reduce((a, b) => a + b, 0) / totals.length;
    return {
      count: totals.length,
      average: average.toFixed(1),
      highest: Math.max(...totals),
      lowest: Math.min(...totals),
    };
  }, [marks]);

  const handleSave = () => {
    const marksArray = Object.entries(marks).map(([student, answers]) => ({ student, answers }));
    updateExamMarks({ id, marks: marksArray });
  };

  const confirmDelete = () => {
    deleteExam(id);
  };

  if (isLoading) return <Loader />;
  if (!exam) return null;

  return (
    <AdminLayout>
      <MetaData title={exam.title} />

      <div className="max-w-6xl mx-auto">
        <AppPageHeader
          title={exam.title}
          subtitle={`${exam.course?.courseName} · ${exam.classGroup?.displayName}`}
          backUrl="/teacher/exams"
        />

        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500">
          <span>
            <i className="fa fa-calendar mr-1"></i>
            {new Date(exam.date).toLocaleDateString()}
          </span>
          <span>
            <i className="fa fa-list-ol mr-1"></i>
            {exam.totalQuestions} {t("questions")} × {exam.marksPerQuestion} {t("marks")} = {exam.totalMarks}{" "}
            {t("total")}
          </span>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <AppCard>
              <p className="text-xs text-gray-500 uppercase">{t("Students")}</p>
              <p className="text-2xl-custom font-bold text-dark">{stats.count}</p>
            </AppCard>
            <AppCard>
              <p className="text-xs text-gray-500 uppercase">{t("Average")}</p>
              <p className="text-2xl-custom font-bold text-brand-600">{stats.average}</p>
            </AppCard>
            <AppCard>
              <p className="text-xs text-gray-500 uppercase">{t("Highest")}</p>
              <p className="text-2xl-custom font-bold text-green-600">{stats.highest}</p>
            </AppCard>
            <AppCard>
              <p className="text-xs text-gray-500 uppercase">{t("Lowest")}</p>
              <p className="text-2xl-custom font-bold text-red-500">{stats.lowest}</p>
            </AppCard>
          </div>
        )}

        <AppCard
          title={t("Marks")}
          icon="fa-table"
          footer={
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                  <i className="fa fa-trash mr-1"></i>
                  {t("Delete Exam")}
                </button>
                <AppButton
                  to={`/teacher/exam/${id}/report`}
                  label={t("Print Report")}
                  icon="fa-print"
                  variant="secondary"
                />
              </div>
              <AppButton
                onClick={handleSave}
                label={t("Save Marks")}
                loadingLabel={t("Saving...")}
                isLoading={isSaving}
                icon="fa-save"
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    {t("Student")}
                  </th>
                  {questionIndexes.map((i) => (
                    <th
                      key={i}
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Q{i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("Total")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exam.marks.map((m) => {
                  const studentId = m.student._id || m.student;
                  return (
                    <tr key={studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white">
                        <p className="text-sm font-medium text-dark">{getFullName(m.student)}</p>
                        <p className="text-xs text-gray-400">{m.student?.userId}</p>
                      </td>
                      {questionIndexes.map((i) => (
                        <td key={i} className="px-2 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={exam.marksPerQuestion}
                            value={marks[studentId]?.[i] ?? 0}
                            onChange={(e) => handleAnswerChange(studentId, i, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-14 text-center border border-gray-200 rounded-md py-1.5 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-brand-50 text-brand-700">
                          {rowTotal(studentId)} / {exam.totalMarks}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AppCard>
      </div>

      <ConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleting}
        message={t("Are you sure you want to delete this exam? All recorded marks will be lost.")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ExamMarksEditor;
