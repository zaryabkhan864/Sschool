import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import TeacherDashboard from "../dashboard/TeacherDashboard";

const teacherRoutes = () => {
  return (
    <Route
      path="/teacher/dashboard"
      element={
        <ProtectedRoute teacher={true}>
          <TeacherDashboard />
        </ProtectedRoute>
      }
    />
  );
};

export default teacherRoutes;
