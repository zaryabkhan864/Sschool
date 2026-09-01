import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import TeacherDashboard from "../dashboard/TeacherDashboard";

// ✅ NEW — Homework & Assignment (teacher side)
import ListHomeworkTeacher from "../homework/ListHomeworkTeacher";
import NewHomework from "../homework/NewHomework";
import UpdateHomework from "../homework/UpdateHomework";
import HomeworkDetailsTeacher from "../homework/HomeworkDetailsTeacher";
import HomeworkSubmissionsList from "../homework/HomeworkSubmissionsList";

// ✅ NEW — Quiz (teacher side)
import ListQuizzes from "../quiz/ListQuizzes";
import NewOrFetchQuiz from "../quiz/NewOrFetchQuiz";
import QuizMarksEditor from "../quiz/QuizMarksEditor";
import QuizReport from "../Reports/Quiz/QuizReport";

// ✅ NEW — Exam (teacher side)
import ListExams from "../exam/ListExams";
import NewOrFetchExam from "../exam/NewOrFetchExam";
import ExamMarksEditor from "../exam/ExamMarksEditor";
import ExamReport from "../Reports/Exam/ExamReport";

// ✅ NEW — Project (teacher side)
import ListProjectsTeacher from "../project/ListProjectsTeacher";
import NewProject from "../project/NewProject";
import UpdateProject from "../project/UpdateProject";
import ProjectDetailsTeacher from "../project/ProjectDetailsTeacher";
import ProjectSubmissionsList from "../project/ProjectSubmissionsList";

const teacherRoutes = () => {
  return (
    <>
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute teacher={true}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW — Homework & Assignment routes */}
      {/* ✅ admin={true} added — admin can access every teacher-side
          module below except the dashboard itself, same pattern as
          financeRoutes.jsx (e.g. <ProtectedRoute finance={true} admin={true}>) */}
      <Route
        path="/teacher/homework"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ListHomeworkTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/homework/new"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <NewHomework />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/homework/:id"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <HomeworkDetailsTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/homework/:id/edit"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <UpdateHomework />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/homework/:id/submissions"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <HomeworkSubmissionsList />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW — Quiz routes */}
      <Route
        path="/teacher/quizzes"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ListQuizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/quiz/new"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <NewOrFetchQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/quiz/:id"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <QuizMarksEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/quiz/:id/report"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <QuizReport />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW — Exam routes */}
      <Route
        path="/teacher/exams"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ListExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exam/new"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <NewOrFetchExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exam/:id"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ExamMarksEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/exam/:id/report"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ExamReport />
          </ProtectedRoute>
        }
      />

      {/* ✅ NEW — Project routes (these were missing before — this is why
          /teacher/projects wasn't working) */}
      <Route
        path="/teacher/projects"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ListProjectsTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/projects/new"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <NewProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/projects/:id"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ProjectDetailsTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/projects/:id/edit"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <UpdateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/projects/:id/submissions"
        element={
          <ProtectedRoute teacher={true} admin={true}>
            <ProjectSubmissionsList />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default teacherRoutes;