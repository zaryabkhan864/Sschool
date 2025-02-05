import React from "react";
import { Route } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import ListUsers from "../admin/ListUsers";
import StudentReviews from "../admin/StudentReviews";
import UpdateUser from "../admin/UpdateUser";
import ProtectedRoute from "../auth/ProtectedRoute";
import Register from "../auth/Register";
import ListStudentCounseling from "../counseling/ListStudentCounseling";
import StudentCounseling from "../counseling/StudentCounseling";
import StudentCounselingDetails from "../counseling/StudentCounselingDetails";
import UpdateStudentCounseling from "../counseling/UpdateStudentCounseling";
import CourseDetails from "../course/CourseDetails";
import ListCourses from "../course/ListCourses";
import NewCourse from "../course/NewCourse";
import UpdateCourse from "../course/UpdateCourse";
import EventDetails from "../event/EventDetails";
import ListEvents from "../event/ListEvents";
import NewEvent from "../event/NewEvent";
import UpdateEvent from "../event/UpdateEvent";
import AddExam from "../exam/AddExam";
import GradeDetails from "../grade/GradeDetails";
import ListGrades from "../grade/ListGrades";
import NewGrade from "../grade/NewGrade";
import UpdateGrade from "../grade/UpdateGrade";
import AddQuiz from "../quiz/AddQuiz";
import ListStudents from "../student/ListStudents";
import NewStudent from "../student/NewStudent";
import StudentDetails from "../student/StudentDetails";
import UpdateStudent from "../student/UpdateStudent";
import ListTeachers from "../teacher/ListTeachers";
import NewTeacher from "../teacher/NewTeacher";
import TeacherDetails from "../teacher/TeacherDetails";
import UpdateTeacher from "../teacher/UpdateTeacher";
import NewTeacherLeave from "../teacherLeave/NewTeacherLeave";

const adminRoutes = () => {
  return (
    <>
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute admin={true} teacher={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/register"
        element={
          <ProtectedRoute admin={true}>
            <Register />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grade/new"
        element={
          <ProtectedRoute admin={true}>
            <NewGrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades"
        element={
          <ProtectedRoute admin={true}>
            <ListGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateGrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grade/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <GradeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/course/new"
        element={
          <ProtectedRoute admin={true}>
            <NewCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute admin={true}>
            <ListCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/course/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher/new"
        element={
          <ProtectedRoute admin={true}>
            <NewTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute admin={true}>
            <ListTeachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <TeacherDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacherleave/new"
        element={
          <ProtectedRoute admin={true}>
            <NewTeacherLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute admin={true}>
            <ListStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student/new"
        element={
          <ProtectedRoute admin={true}>
            <NewStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <StudentDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/counseling/new"
        element={
          <ProtectedRoute admin={true}>
            <StudentCounseling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/counselings"
        element={
          <ProtectedRoute admin={true}>
            <ListStudentCounseling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/counselings/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateStudentCounseling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/counseling/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <StudentCounselingDetails />
          </ProtectedRoute>
        }
      />
      {/* add quiz routes */}
      <Route
        path="/admin/quiz/new"
        element={
          <ProtectedRoute admin={true}>
            <AddQuiz />
          </ProtectedRoute>
        }
      />
      {/* add quiz routes */}
      <Route
        path="/admin/exam"
        element={
          <ProtectedRoute admin={true}>
            <AddExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/event/new"
        element={
          <ProtectedRoute admin={true}>
            <NewEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute admin={true}>
            <ListEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/event/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute admin={true}>
            <ListUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute admin={true}>
            <StudentReviews />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default adminRoutes;
