import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/api/authApi";
import { useGetSchoolQuery } from "../../redux/api/schoolApi";
import MetaData from "../layout/MetaData";
import { useTranslation } from 'react-i18next';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PhotoIcon,
  PhoneIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data: schoolData } = useGetSchoolQuery();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const routes = {
        admin: "/admin/dashboard",
        teacher: "/teacher/dashboard",
        student: "/student/dashboard",
        principle: "/principle/dashboard",
        finance: "/finance/dashboard",
        counselor: "/counselor/dashboard",
      };
      if (routes[user.role]) {
        navigate(routes[user.role]);
      }
    }

    if (error) {
      toast.error(error?.data?.message || "Login failed");
    }
  }, [error, isAuthenticated, user, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <>
      <MetaData title={t("login")} />

      {/* Main Container */}
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-surface-50 font-sans antialiased">
        
        {/* Left Section: Branding & Identity */}
        <div className="lg:w-7/12 w-full bg-gradient-to-br from-navy-950 via-brand-950 to-navy-900 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          
          {/* Ambient Lighting FX */}
          <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs-custom font-semibold text-brand-200 backdrop-blur-md shadow-soft">
              <SparklesIcon className="w-4 h-4 text-brand-400" />
              <span>EduSync Pro · Product of Buckserve</span>
            </div>
          </div>

          {/* Center Identity Block */}
          <div className="my-auto py-10 space-y-6 z-10 max-w-2xl mx-auto text-center animate-slide-up">
            
            {/* Logo Wrapper */}
            <div className="flex justify-center items-center">
              {schoolData?.logo?.url ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-brand-400/20 rounded-full blur-2xl transform scale-125 pointer-events-none transition-all duration-500 group-hover:scale-150" />
                  <img
                    src={schoolData.logo.url}
                    alt={schoolData?.name || "School Logo"}
                    className="relative w-32 h-32 lg:w-44 lg:h-44 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-card">
                  <PhotoIcon className="w-16 h-16 text-brand-200" />
                </div>
              )}
            </div>

            {/* School Name & Tagline */}
            <div className="space-y-3">
              <h1 className="text-display-sm lg:text-display-lg font-extrabold tracking-tight text-white leading-tight font-heading">
                {schoolData?.name || "School Portal"}
              </h1>
              <p className="text-lg-custom lg:text-xl-custom text-brand-200/90 font-medium">
                {schoolData?.tagline || t("School Management System")}
              </p>
            </div>

            <p className="text-surface-300 text-sm-custom lg:text-base-custom leading-relaxed max-w-lg mx-auto">
              Welcome to the official portal. Access your personalized dashboard to manage academic activities, track performance, and view school operations seamlessly.
            </p>
          </div>

          {/* Footer Security Badge */}
          <div className="z-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs-custom text-surface-300">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Encrypted 256-bit Secure Portal</span>
            </div>
            <div className="text-center sm:text-right">
              © {new Date().getFullYear()} <span className="text-white font-semibold">Buckserve</span>. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Section: Form Container */}
        <div className="lg:w-5/12 w-full bg-white p-8 lg:p-16 flex flex-col justify-between shadow-card">
          
          <div className="my-auto max-w-md w-full mx-auto space-y-8 animate-fade-in">
            
            <div className="space-y-2">
              <h2 className="text-2xl-custom lg:text-display-sm font-extrabold text-navy-900 tracking-tight font-heading">
                {t("login")}
              </h2>
              <p className="text-sm-custom text-slate-500">
                Sign in with your registered credentials to proceed.
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs-custom font-bold text-navy-800 uppercase tracking-wider">
                  {t("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@school.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-navy-900 text-sm-custom focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs-custom font-bold text-navy-800 uppercase tracking-wider">
                  {t("password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-surface-50 border border-surface-200 rounded-xl text-navy-900 text-sm-custom focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-navy-800 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-slate-400 hover:text-navy-800 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-xs-custom">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-surface-200 text-brand-600 focus:ring-brand-500 transition"
                  />
                  Remember me
                </label>
                <a
                  href="/password/forgot"
                  className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  {t("forgetPassword")}?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 text-white font-bold text-sm-custom rounded-xl shadow-button hover:shadow-glow-brand transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("authenticating")}...</span>
                  </>
                ) : (
                  <span>{t("login")}</span>
                )}
              </button>
            </form>

            {/* Support Block */}
            <div className="pt-6 border-t border-surface-200 text-center space-y-2">
              <p className="text-xs-custom text-slate-500 font-medium">
                Technical Support by <span className="font-bold text-navy-900">Buckserve</span>
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs-custom text-brand-600 font-semibold bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                <PhoneIcon className="w-3.5 h-3.5" />
                <a href="tel:+905074467087" className="hover:underline">
                  +90-507-446-7087
                </a>
              </div>
            </div>

          </div>

          {/* Footer Branding */}
          <div className="text-center text-xs-custom text-slate-400 pt-8">
            Powered by <span className="font-semibold text-navy-800">EduSync Pro</span> · Developed by Buckserve
          </div>

        </div>

      </div>
    </>
  );
};

export default Login;