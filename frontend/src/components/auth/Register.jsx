import React, { useEffect, useState } from "react";
import { useRegisterMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useGetAdminUsersQuery } from "../../redux/api/userApi";

const Register = () => {
  const navigate = useNavigate();
  const { refetch } = useGetAdminUsersQuery();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const { name, email, password, role } = user;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("User registered successfully");
      navigate("/admin/users");
      refetch();
    }
  }, [error, isSuccess, navigate, refetch]);

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    register(user);
  };

  return (
    <AdminLayout>
      <MetaData title={"Register New User"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">Register New User</h2>
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label htmlFor="name_field" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="name"
                value={name}
                onChange={onChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email_field" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="email"
                value={email}
                onChange={onChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password_field" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="password"
                value={password}
                onChange={onChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="role_field" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role_field"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="role"
                value={role}
                onChange={onChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring focus:ring-blue-300`}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "REGISTER"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Register;
