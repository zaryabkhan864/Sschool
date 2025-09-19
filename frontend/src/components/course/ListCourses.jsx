import { Pagination, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "../../redux/api/courseApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";

const ListCourses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetCoursesQuery();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [userRole, setUserRole] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [
    deleteCourse,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteCourseMutation();

  // For delete confirmation modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (deleteError) {
      toast.error(deleteError?.data?.message);
    }

    if (isSuccess) {
      toast.success(t("courseDeleted"));
      refetch();
      setShowModal(false);
      setSelectedCourseId(null);
    }

    if (user?.role === "admin") setUserRole(user?.role);
  }, [error, deleteError, isSuccess, navigate, refetch, user, t]);

  // Filter and paginate the courses
  const filteredCourses = data?.courses?.filter((course) =>
    course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course?.campus?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id) => {
    setSelectedCourseId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedCourseId) {
      deleteCourse(selectedCourseId);
    }
  };

  const totalPages = Math.ceil((filteredCourses?.length || 0) / itemsPerPage);
  const paginatedCourses = filteredCourses?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allCourses")} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {data?.courses?.length} {t("Courses")}
          </h2>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            {/* Search Bar */}
            <input
              type="text"
              placeholder={t("search")}
              className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Records per Page Dropdown */}
            <div className="flex items-center mt-2 md:mt-0">
              <label
                htmlFor="itemsPerPage"
                className="mr-2 text-sm font-medium"
              >
                {t("entriesPerPage")}:
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

          {/* Courses Table */}
          <Table hoverable={true} className="w-full">
            <Table.Head>

              <Table.HeadCell>{t("Course")} {t("Name")}</Table.HeadCell>
              <Table.HeadCell>{t("Campus")}</Table.HeadCell>
              <Table.HeadCell>{t("Code")}</Table.HeadCell>
              <Table.HeadCell>{t("Teacher")}</Table.HeadCell>
              <Table.HeadCell>{t("actions")}</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {paginatedCourses?.map((course) => (
                <Table.Row
                  key={course?._id}
                  className="bg-white dark:bg-gray-800"
                >
        
                  <Table.Cell>{course?.courseName}</Table.Cell>
                  <Table.Cell>{course?.campus?.name || 'N/A'}</Table.Cell>
                  <Table.Cell>{course?.code}</Table.Cell>
                  <Table.Cell>{course?.teacher?.name || 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      {userRole === "admin" && (
                        <Link
                          to={`/admin/courses/${course?._id}`}
                          className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>
                      )}
                      <Link
                        to={`/admin/course/${course?._id}/details`}
                        className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                      >
                        <i className="fa fa-eye"></i>
                      </Link>
                      {userRole === "admin" && (
                        <button
                          className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                          onClick={() => handleDeleteClick(course?._id)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Do you want to delete this course?")}
      />
    </AdminLayout>
  );
};

export default ListCourses;