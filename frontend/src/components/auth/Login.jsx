import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/api/authApi";
import MetaData from "../layout/MetaData";
import { useTranslation } from 'react-i18next';
import {
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // Role-specific colors and icons
  const roleInfo = {
    admin: { color: "from-purple-600 to-violet-500", icon: <ShieldCheckIcon className="w-6 h-6" /> },
    teacher: { color: "from-blue-600 to-cyan-500", icon: <AcademicCapIcon className="w-6 h-6" /> },
    student: { color: "from-emerald-600 to-green-500", icon: <UserIcon className="w-6 h-6" /> },
    principle: { color: "from-indigo-600 to-blue-500", icon: <BuildingLibraryIcon className="w-6 h-6" /> },
    finance: { color: "from-amber-600 to-yellow-500", icon: null },
    counsellor: { color: "from-rose-600 to-pink-500", icon: null }
  };

  return (
    <>
      <MetaData title={t("login")} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
            
            {/* Left Side - Branding & Info */}
            <div className="w-full lg:w-1/2 space-y-8 z-10">
              {/* Logo & Brand */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <AcademicCapIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    EduSync Pro
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    School Management System
                  </p>
                </div>
              </div>

              {/* Hero Text */}
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                  Welcome Back to<br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Modern Education
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Access your personalized dashboard to manage academic activities, 
                  track progress, and collaborate seamlessly with the educational community.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Secure Access</h4>
                    <p className="text-sm text-gray-600">Enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <UserIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Role-Based Access</h4>
                    <p className="text-sm text-gray-600">Personalized dashboards</p>
                  </div>
                </div>
              </div>

              {/* User Roles Preview */}
              <div className="pt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Access Different Portals:</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(roleInfo).map(([role, info]) => (
                    <div
                      key={role}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <span className="font-bold capitalize text-gray-700">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 max-w-md z-10">
              <div className="relative">
                {/* Form Container */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                  {/* Form Header */}
                  <div className="p-8 pb-6">
                    <div className="text-center mb-2">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <AcademicCapIcon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-black text-gray-900">
                        {t('login')}
                      </h2>
                      <p className="text-gray-600 text-sm mt-2">
                        Sign in to your account to continue
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submitHandler} className="space-y-6">
                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <EnvelopeIcon className="w-4 h-4" />
                          {t('email')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email_field"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <LockClosedIcon className="w-4 h-4" />
                          {t('password')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password_field"
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Forgot Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                          </label>
                        </div>
                        <a
                          href="/password/forgot"
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {t('forgetPassword')}?
                        </a>
                      </div>

                      {/* Submit Button */}
                      <button
                        id="login_button"
                        type="submit"
                        disabled={isLoading}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                          isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {t("authenticating")}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5" />
                            {t('login')}
                          </div>
                        )}
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    {/* Alternative Login Options */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Google</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">GitHub</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-center text-sm text-gray-600">
                      Don't have an account?{' '}
                      <a href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Contact Admin
                      </a>
                    </p>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              © 2024 EduSync Pro. All rights reserved.{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                Privacy Policy
              </a>{' '}
              ·{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};

export default Login;