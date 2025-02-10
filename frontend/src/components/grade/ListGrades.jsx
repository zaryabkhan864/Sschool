import { Pagination, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  useDeleteGradeMutation,
  useGetGradesQuery,
} from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const ListGrades = () => {
    const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetGradesQuery();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [userRole, setUserRole] = useState("");

  const [
    deleteGrade,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteGradeMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (deleteError) toast.error(deleteError?.data?.message);
    if (isSuccess) {
      toast.success("Grade Deleted");
      refetch();
    }
    if (user?.role === "admin") setUserRole(user?.role);
  }, [error, deleteError, isSuccess, navigate, refetch, user]);

  const deleteGradeHandler = (id) => {
    deleteGrade(id);
  };

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
      <MetaData title={t("allGrades")} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {data?.grades?.length} {t("grades")}
          </h2>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <input
              type="text"
              placeholder={t("search")}
              className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

          {/* Grades Table */}
          <Table hoverable={true} className="w-full">
            <Table.Head>
              <Table.HeadCell>{t("id")}</Table.HeadCell>
              <Table.HeadCell>{t("gradeName")}</Table.HeadCell>
              <Table.HeadCell>{t("yearFrom")}</Table.HeadCell>
              <Table.HeadCell>{t("yearTo")}</Table.HeadCell>
              <Table.HeadCell>{t("actions")}</Table.HeadCell>
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
      </div>
    </AdminLayout>
  );
};

export default ListGrades;
