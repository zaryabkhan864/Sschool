import React, { useEffect, useState } from "react";
import { useLoginMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MetaData from "../layout/MetaData";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [login, { isLoading, error, data }] = useLoginMutation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
    if (error) {
      toast.error(error?.data?.message);
    }
  }, [error, isAuthenticated]);

  const submitHandler = (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };
    console.log("what is data in login", loginData);
    login(loginData);
  };

  return (
    <>
      <MetaData title={"Login"} />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center min-h-screen px-4 py-6 bg-gray-100">
        {/* Left Side - Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <img
            src="/images/loginImage.png"
            alt="Login Illustration"
            className="w-3/4 lg:w-full max-w-sm lg:max-w-md object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={submitHandler}>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            <div className="mb-4">
              <label
                htmlFor="email_field"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password_field"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <a
                href="/password/forgot"
                className="text-sm text-orange-500 hover:underline"
              >
                Forgot Password?
              </a>
              <a
                href="/register"
                className="text-sm text-gray-500 hover:underline"
              >
                New User?
              </a>
            </div>

            <button
              id="login_button"
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md shadow hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
