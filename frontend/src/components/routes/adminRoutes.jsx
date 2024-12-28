import React from "react";
import { Route } from "react-router-dom";
import Dashboard from "../admin/Dashboard";
import ListStudents from "../admin/ListStudents";
import ListUsers from "../admin/ListUsers";
import NewStudent from "../admin/NewStudent";
import StudentReviews from "../admin/StudentReviews";
import UpdateUser from "../admin/UpdateUser";
import ProtectedRoute from "../auth/ProtectedRoute";
import NewCourse from "../course/NewCourse";
import GradeDetails from "../grade/GradeDetails";
import ListGrades from "../grade/ListGrades";
import NewGrade from "../grade/NewGrade";
import UpdateGrade from "../grade/UpdateGrade";
import ListCourses from "../course/ListCourses";
import UpdateCourse from "../course/UpdateCourse";
import CourseDetails from "../course/CourseDetails";
import Register from "../auth/Register";

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
