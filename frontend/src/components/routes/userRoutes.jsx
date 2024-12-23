import React from "react";
import { Route } from "react-router-dom";

import Login from "../auth/Login";
import Register from "../auth/Register";
import Profile from "../user/Profile";
import UpdateProfile from "../user/UpdateProfile";
import ProtectedRoute from "../auth/ProtectedRoute";
import UploadAvatar from "../user/UploadAvatar";
import UpdatePassword from "../user/UpdatePassword";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword from "../auth/ResetPassword";


const userRoutes = () => {
  return (
    <>
      {/* <Route path="/" element={<Home />} /> */}

      <Route path="/" element={<Login />} exact />
      <Route path="/register" element={<Register />} />

      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />

      <Route
        path="/me/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/me/update_profile"
        element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/me/upload_avatar"
        element={
          <ProtectedRoute>
            <UploadAvatar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/me/update_password"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />


    </>
  );
};

export default userRoutes;
