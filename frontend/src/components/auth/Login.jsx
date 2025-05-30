import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/api/authApi";
import MetaData from "../layout/MetaData";
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [login, { isLoading, error, data }] = useLoginMutation();
  const {
    isAuthenticated,
    user,
    isLoading: userLoading,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard");
    }
    if (isAuthenticated && user?.role === "teacher") {
      navigate("/teacher/dashboard");
    }
    if (isAuthenticated && user?.role === "student") {
      navigate("/student/dashboard");
    }
    if (isAuthenticated && user?.role === "principle") {
      navigate("/principle/dashboard");
    }
    if (isAuthenticated && user?.role === "finance") {
      navigate("/finance/dashboard");
    }
    if (isAuthenticated && user?.role === "counsellor") {
      navigate("/counsellor/dashboard");
    }

    if (error) {
      toast.error(error?.data?.message);
    }
  }, [error, isAuthenticated, user]);

  const submitHandler = (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };

    login(loginData);
  };

  return (
    <>
      <MetaData title={t("login")} />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center min-h-screen px-4 py-6 bg-gradient-to-r from-blue-50 to-purple-50">
        {/* Left Side - Image */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <img
            src="/images/loginImage.png"
            alt="Login Illustration"
            className="w-3/4 lg:w-full max-w-sm lg:max-w-md object-cover rounded-lg "
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-2xl p-8 max-w-md">
          <form onSubmit={submitHandler}>
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">{t('login')}</h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              Welcome back to <span className="font-semibold text-blue-800">School Management System</span>. Please log in to access your account and manage your school activities efficiently.
            </p>

            <div className="mb-6">
              <label
                htmlFor="email_field"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('email')}
              </label>
              <input
                type="email"
                id="email_field"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password_field"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('password')}
              </label>
              <input
                type="password"
                id="password_field"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <a
                href="/password/forgot"
                className="text-sm text-blue-600 hover:underline"
              >
                {t('forgetPassword')}?
              </a>
            </div>

            <button
              id="login_button"
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? t("authenticating") : t('login')}
            </button>

            <p className="text-sm text-gray-600 text-center mt-6">
              Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Contact Admin</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;