import React, { useEffect } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";

import AdminLayout from "../layout/AdminLayout";

import {
  useDeleteUserMutation,
  useGetAdminUsersQuery,
} from "../../redux/api/userApi";

const ListUsers = () => {
  const { data, isLoading, error } = useGetAdminUsersQuery();

  const [
    deleteUser,
    { error: deleteError, isLoading: isDeleteLoading, isSuccess },
  ] = useDeleteUserMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (deleteError) {
      toast.error(deleteError?.data?.message);
    }

    if (isSuccess) {
      toast.success("User Deleted");
    }
  }, [error, deleteError, isSuccess]);

  const deleteUserHandler = (id) => {
    deleteUser(id);
  };

  const setUsers = () => {
    return data?.users?.map((user) => (
      <tr key={user?._id} className="text-sm border-b hover:bg-gray-100">
        <td className="px-4 py-2">{user?._id}</td>
        <td className="px-4 py-2">{user?.name}</td>
        <td className="px-4 py-2">{user?.email}</td>
        <td className="px-4 py-2 capitalize">{user?.role}</td>
        <td className="px-4 py-2 flex flex-wrap gap-2">
          <Link
            to={`/admin/users/${user?._id}`}
            className="text-blue-500 hover:underline"
          >
            <i className="fas fa-pencil-alt"></i>
          </Link>
          <button
            className="text-red-500 hover:underline"
            onClick={() => deleteUserHandler(user?._id)}
            disabled={isDeleteLoading}
          >
            <i className="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    ));
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Users"} />

      <h1 className="text-2xl font-bold my-5 text-center">
        {data?.users?.length} Users
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>{setUsers()}</tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ListUsers;