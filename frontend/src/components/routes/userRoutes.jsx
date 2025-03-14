import React from "react";
import { Route } from "react-router-dom";
import Login from "../auth/Login";
import Profile from "../user/Profile";
import UpdateProfile from "../user/UpdateProfile";
import ProtectedRoute from "../auth/ProtectedRoute";
import UploadAvatar from "../user/UploadAvatar";
import UpdatePassword from "../user/UpdatePassword";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword from "../auth/ResetPassword";
import PostingWall from "../posting/PostingWall";
const userRoutes = () => {
  return (
    <>
      <Route path="/" element={<Login />} exact />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />
      <Route path="/me/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/me/update_profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
      <Route path="/me/upload_avatar" element={<ProtectedRoute><UploadAvatar /></ProtectedRoute>} />
      <Route path="/me/update_password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
      {/* posting wall */}
      <Route path="/posting_wall" element={<ProtectedRoute><PostingWall /></ProtectedRoute>} />
    </>
  );
};

export default userRoutes;