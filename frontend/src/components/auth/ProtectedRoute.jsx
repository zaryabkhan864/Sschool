import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../layout/Loader";

const ProtectedRoute = ({ admin, teacher, student, finance, principle, counsellor, children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user is neither admin nor teacher nor student nor finance nor principle nor counsellor
  if ((admin && user?.role !== "admin") &&
    (teacher && user?.role !== "teacher") &&
    (student && user?.role !== "student") &&
    (finance && user?.role !== "finance") &&
    (principle && user?.role !== "principle") &&
    (counsellor && user?.role !== "counsellor")
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
