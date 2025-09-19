import { Pagination, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetTeacherLeavesQuery,
  useDeleteTeacherLeaveMutation,
} from "../../redux/api/teacherLeaveApi"; // ✅ plural
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";

const ListTeacherLeave = () => {
  const { t } = useTranslation();

  const { data, isLoading, error, refetch } = useGetTeacherLeavesQuery(); // ✅ plural
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [userRole, setUserRole] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [
    deleteTeacherLeave,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteTeacherLeaveMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (deleteError) toast.error(deleteError?.data?.message);
    if (isSuccess) {
      toast.success(t("teacherLeaveDeleted"));
      refetch();
      setShowModal(false);
      setSelectedLeaveId(null);
    }
  
    if (user?.role === "admin" || user?.role === "principle") {
      setUserRole(user?.role);
    }
  }, [error, deleteError, isSuccess, user, t, refetch]);

  const filteredLeaves = data?.teacherLeaves?.filter((leave) =>
    leave?.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id) => {
    setSelectedLeaveId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedLeaveId) deleteTeacherLeave(selectedLeaveId);
  };

  const totalPages = Math.ceil((filteredLeaves?.length || 0) / itemsPerPage);
  const paginatedLeaves = filteredLeaves?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("allTeacherLeaves")} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {data?.teacherLeaves?.length} {t("Teacher Leaves")}
          </h2>

          {/* Search + pagination settings */}
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

          {/* Table */}
          <Table hoverable={true} className="w-full">
            <Table.Head>
              <Table.HeadCell>{t("id")}</Table.HeadCell>
              <Table.HeadCell>{t("Teacher")}</Table.HeadCell>
              <Table.HeadCell>{t("Leave Type")}</Table.HeadCell>
              <Table.HeadCell>{t("Start Date")}</Table.HeadCell>
              <Table.HeadCell>{t("End Date")}</Table.HeadCell>
              <Table.HeadCell>{t("Total Days")}</Table.HeadCell>
              <Table.HeadCell>{t("Reason")}</Table.HeadCell>
              <Table.HeadCell>{t("Status")}</Table.HeadCell>
              <Table.HeadCell>{t("actions")}</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {paginatedLeaves?.map((leave) => (
                <Table.Row key={leave?._id} className="bg-white dark:bg-gray-800">
                  <Table.Cell>{leave?._id}</Table.Cell>
                  <Table.Cell>{leave?.teacher?.name}</Table.Cell>
                  <Table.Cell>{leave?.leaveType}</Table.Cell>
                  <Table.Cell>
                    {new Date(leave?.startDate).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    {leave?.endDate
                      ? new Date(leave?.endDate).toLocaleDateString()
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>{leave?.totalDays}</Table.Cell>
                  <Table.Cell>{leave?.reason}</Table.Cell>
                  <Table.Cell>{leave?.status}</Table.Cell>
                  <Table.Cell>
  <div className="flex space-x-2">
    {/* View Button */}
    <Link
      to={`/admin/teacher-leave/${leave?._id}/details`}
      className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
    >
      <i className="fa fa-eye"></i>
    </Link>

    {/* Edit Button (only admin & principle) */}
    {(userRole === "admin" || userRole === "principle") && (
      <Link
        to={`/admin/teacher-leave/${leave?._id}/edit`}
        className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
      >
        <i className="fa fa-edit"></i>
      </Link>
    )}

    {/* Delete Button (only admin & principle) */}
    {(userRole === "admin" || userRole === "principle") && (
      <button
        className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
        onClick={() => handleDeleteClick(leave?._id)}
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

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Do you want to delete this leave record?")}
      />
    </AdminLayout>
  );
};

export default ListTeacherLeave;
