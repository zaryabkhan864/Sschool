import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../layout/Loader";

const ProtectedRoute = ({ admin, teacher, children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user is neither admin nor teacher
  if ((admin && user?.role !== "admin") && (teacher && user?.role !== "teacher")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
