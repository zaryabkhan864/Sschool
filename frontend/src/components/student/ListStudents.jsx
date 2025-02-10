import { Pagination, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {useDeleteUserMutation, useGetUserByTypeQuery } from "../../redux/api/userApi";


import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

const ListStudents = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetUserByTypeQuery("student");
  const { user } = useSelector((state) => state.auth);
  const [userRole, setUserRole] = useState("");

  const [
    deleteUser,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (deleteError) toast.error(deleteError?.data?.message);
    if (isSuccess) {
      toast.success("Student Deleted");
      refetch();
    }
    if (user?.role === "admin") setUserRole(user?.role);
  }, [error, deleteError, isSuccess, navigate, refetch, user]);

  const deleteStudentHandler = (id) => {
    deleteUser(id);
  };

  const filteredStudents = data?.users?.filter((student) =>
    student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((filteredStudents?.length || 0) / itemsPerPage);
  const paginatedStudents = filteredStudents?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Students"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {data?.users?.length} Students
          </h2>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center mt-2 md:mt-0">
              <label
                htmlFor="itemsPerPage"
                className="mr-2 text-sm font-medium"
              >
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

          {/* Students Table */}
          <Table hoverable={true} className="w-full">
            <Table.Head>
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Student Name</Table.HeadCell>
              <Table.HeadCell>Age</Table.HeadCell>
              <Table.HeadCell>Grade</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {paginatedStudents?.map((student) => (
                <Table.Row
                  key={student?._id}
                  className="bg-white dark:bg-gray-800"
                >
                  <Table.Cell>{student?._id}</Table.Cell>
                  <Table.Cell>{student?.name}</Table.Cell>
                  <Table.Cell>{student?.age}</Table.Cell>
                  <Table.Cell>{student?.grade?.gradeName|| 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      {userRole === "admin" && (
                        <Link
                          to={`/admin/students/${student?._id}`}
                          className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>
                      )}
                      <Link
                        to={`/admin/student/${student?._id}/details`}
                        className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                      >
                        <i className="fa fa-eye"></i>
                      </Link>
                      {userRole === "admin" && (
                        <button
                          className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                          onClick={() => deleteStudentHandler(student?._id)}
                          disabled={isDeleteLoading}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      )}
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

export default ListStudents;
