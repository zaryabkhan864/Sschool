import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import Dashboard from "../admin/Dashboard";
import ListUsers from "../admin/ListUsers";
import UpdateUser from "../admin/UpdateUser";
import StudentReviews from "../admin/StudentReviews";
import NewStudent from "../admin/NewStudent";
import ListStudents from "../admin/ListStudents";
import NewGrade from "../grade/NewGrade";
import ListGrades from "../grade/ListGrades";
import Header from "../layout/Header";

const adminRoutes = () => {
  return (
    <>

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute admin={true}>
            <Dashboard />
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
        path="/admin/students"
        element={
          <ProtectedRoute admin={true}>
            <ListStudents />
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
