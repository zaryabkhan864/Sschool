import { Pagination, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useDeleteGradeMutation, useGetGradesQuery, } from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import { useSelector } from "react-redux";
import { use } from "react";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";


const ListGrades = () => {
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useGetGradesQuery();
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    const [userRole, setUserRole] = useState("");
    const [
        deleteGrade,
        { isLoading: isDeleteLoading, error: deleteError, isSuccess },
    ] = useDeleteGradeMutation();

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
            toast.success("Grade Deleted");
            refetch();
        }
        if (user.role == "admin") {
            setUserRole(user?.role);
        }
        if (isSuccess) {
            toast.success("Grade Deleted");
            refetch();
        }
    }, [error, deleteError, isSuccess, navigate, refetch]);

    const deleteGradeHandler = (id) => {
        deleteGrade(id);
    };

    // Filter and paginate the grades
    const filteredGrades = data?.grades?.filter((grade) =>
        grade?.gradeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil((filteredGrades?.length || 0) / itemsPerPage);
    const paginatedGrades = filteredGrades?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) return <Loader />;

    return (
        <AdminLayout>
            <MetaData title={"All Grades"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-6">
                        {data?.grades?.length} Grades
                    </h2>

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

                        {/* Grades Table */}
                        <Table hoverable={true} className="w-full">
                            <Table.Head>
                                <Table.HeadCell>ID</Table.HeadCell>
                                <Table.HeadCell>Grade Name</Table.HeadCell>
                                <Table.HeadCell>Year From</Table.HeadCell>
                                <Table.HeadCell>Year To</Table.HeadCell>
                                <Table.HeadCell>Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {paginatedGrades?.map((grade) => (
                                    <Table.Row key={grade?._id} className="bg-white dark:bg-gray-800">
                                        <Table.Cell>{grade?._id}</Table.Cell>
                                        <Table.Cell>{grade?.gradeName}</Table.Cell>
                                        <Table.Cell>{grade?.yearFrom}</Table.Cell>
                                        <Table.Cell>{grade?.yearTo}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex space-x-2">
                                                {userRole === "admin" && (
                                                    <Link
                                                        to={`/admin/grades/${grade?._id}`}
                                                        className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                                                    >
                                                        <i className="fa fa-pencil"></i>
                                                    </Link>
                                                )}
                                                <Link
                                                    to={`/admin/grade/${grade?._id}/details`}
                                                    className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                                                >
                                                    <i className="fa fa-eye"></i>
                                                </Link>
                                                {userRole === "admin" && (
                                                    <button
                                                        className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                                                        onClick={() => deleteGradeHandler(grade?._id)}
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
                    {/* Records per Page Dropdown */}
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

                {/* Grades Table */}
                <Table hoverable={true} className="w-full">
                    <Table.Head>
                        <Table.HeadCell>ID</Table.HeadCell>
                        <Table.HeadCell>Grade Name</Table.HeadCell>
                        <Table.HeadCell>Year From</Table.HeadCell>
                        <Table.HeadCell>Year To</Table.HeadCell>
                        <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {paginatedGrades?.map((grade) => (
                            <Table.Row
                                key={grade?._id}
                                className="bg-white dark:bg-gray-800"
                            >
                                <Table.Cell>{grade?._id}</Table.Cell>
                                <Table.Cell>{grade?.gradeName}</Table.Cell>
                                <Table.Cell>{grade?.yearFrom}</Table.Cell>
                                <Table.Cell>{grade?.yearTo}</Table.Cell>
                                <Table.Cell>
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/admin/grades/${grade?._id}`}
                                            className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                                        >
                                            <i className="fa fa-pencil"></i>
                                        </Link>
                                        <Link
                                            to={`/admin/grade/${grade?._id}/details`}
                                            className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                                        >
                                            <i className="fa fa-eye"></i>
                                        </Link>
                                        <button
                                            className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                                            onClick={() => deleteGradeHandler(grade?._id)}
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

    </AdminLayout >
  );
};

export default ListGrades;
