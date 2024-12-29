import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";

import { Pagination, Table } from "flowbite-react";
import { useDeleteTeacherMutation, useGetTeachersQuery } from "../../redux/api/teacherApi";
import AdminLayout from "../layout/AdminLayout";

const ListTeachers = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useGetTeachersQuery();

    const [
        deleteTeacher,
        { isLoading: isDeleteLoading, error: deleteError, isSuccess },
    ] = useDeleteTeacherMutation();

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
            toast.success("Teacher Deleted");
            refetch();
        }
    }, [error, deleteError, isSuccess, navigate, refetch]);

    const deleteTeacherHandler = (id) => {
        deleteTeacher(id);
    };

    // Filter and paginate the teachers
    const filteredTeachers = data?.teachers?.filter((teacher) =>
        teacher?.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil((filteredTeachers?.length || 0) / itemsPerPage);
    const paginatedTeachers = filteredTeachers?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) return <Loader />;

    return (
        <AdminLayout>
            <MetaData title={"All Teachers"} />
            <div className="flex justify-center items-center pt-5 pb-10">

                <div className="w-full max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-6">{data?.grades?.length} Teachers</h2>

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

                    {/* Teachers Table */}
                    <Table hoverable={true} className="w-full">
                        <Table.Head>
                            <Table.HeadCell>ID</Table.HeadCell>
                            <Table.HeadCell>Teacher Name</Table.HeadCell>
                            <Table.HeadCell>Age</Table.HeadCell>
                            <Table.HeadCell>Gender</Table.HeadCell>
                            <Table.HeadCell>Nationalty</Table.HeadCell>
                            <Table.HeadCell>Actions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {paginatedTeachers?.map((teacher) => (
                                <Table.Row key={teacher?._id} className="bg-white dark:bg-gray-800">
                                    <Table.Cell>{teacher?._id}</Table.Cell>
                                    <Table.Cell>{teacher?.teacherName}</Table.Cell>
                                    <Table.Cell>{teacher?.age}</Table.Cell>
                                    <Table.Cell>{teacher?.gender}</Table.Cell>
                                    <Table.Cell>{teacher?.nationality}</Table.Cell>
                                    <Table.Cell>
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/admin/teachers/${teacher?._id}`}
                                                className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                                            >
                                                <i className="fa fa-pencil"></i>
                                            </Link>
                                            <Link
                                                to={`/admin/teacher/${teacher?._id}/details`}
                                                className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                                            >
                                                <i className="fa fa-eye"></i>
                                            </Link>
                                            <button
                                                className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                                                onClick={() => deleteTeacherHandler(teacher?._id)}
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

export default ListTeachers;
