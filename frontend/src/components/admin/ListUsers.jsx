import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { Table, Pagination } from "flowbite-react";

import {
  useDeleteUserMutation,
  useGetAdminUsersQuery,
} from "../../redux/api/userApi";

const ListUsers = () => {
  const { data, isLoading, error, refetch } = useGetAdminUsersQuery();

  const [
    deleteUser,
    { error: deleteError, isLoading: isDeleteLoading, isSuccess },
  ] = useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (deleteError) {
      toast.error(deleteError?.data?.message);
    }

    if (isSuccess) {
      toast.success("User Deleted");
      refetch();
    }
  }, [error, deleteError, isSuccess, refetch]);

  const deleteUserHandler = (id) => {
    deleteUser(id);
  };

  // Filter and paginate the users
  const filteredUsers = data?.users?.filter((user) =>
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Users"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">{data?.users?.length} Users</h2>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search..."
              className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Records per Page Dropdown */}
            <div className="flex items-center mt-2 md:mt-0">
              <label htmlFor="itemsPerPage" className="mr-2 text-sm font-medium">
                Entries per page:
              </label>
              <select
                id="itemsPerPage"
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <Table hoverable={true} className="w-full">
            <Table.Head>
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {paginatedUsers?.map((user) => (
                <Table.Row key={user?._id} className="bg-white dark:bg-gray-800">
                  <Table.Cell>{user?._id}</Table.Cell>
                  <Table.Cell>{user?.name}</Table.Cell>
                  <Table.Cell>{user?.email}</Table.Cell>
                  <Table.Cell>{user?.role}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/users/${user?._id}`}
                        className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                      >
                        <i className="fa fa-pencil"></i>
                      </Link>
                      <button
                        className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                        onClick={() => deleteUserHandler(user?._id)}
                        disabled={isDeleteLoading}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              layout="navigation"
              onPageChange={(page) => setCurrentPage(page)}
              showIcons={true}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ListUsers;
