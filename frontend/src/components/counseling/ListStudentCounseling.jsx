import { Pagination, Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  useDeleteCounselingMutation,
  useGetCounselingsQuery,
} from "../../redux/api/counselingApi";
import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

const ListStudentCounselings = () => {
    const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetCounselingsQuery();

  console.log("this is my data", data);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [userRole, setUserRole] = useState("");

  const [
    deleteCounseling,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess },
  ] = useDeleteCounselingMutation();

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
      toast.success("Counseling Deleted");
      refetch();
    }
    if (user?.role === "admin") setUserRole(user?.role);
  }, [error, deleteError, isSuccess, navigate, refetch, user]);

  const deleteCounselingHandler = (id) => {
    deleteCounseling(id);
  };

  // Filter and paginate the counselings
  const filteredCounselings = data?.counselings?.filter((counseling) =>
    String(counseling?.student)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("this is my filtered counselings",filteredCounselings)

  const totalPages = Math.ceil(
    (filteredCounselings?.length || 0) / itemsPerPage
  );
  const paginatedCounselings = filteredCounselings?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={"All Counselings"} />
      <div className="flex justify-center items-center pt-5 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {data?.counselings?.length}  {t('Counselings')}
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

            {/* Records per Page Dropdown */}
            <div className="flex items-center mt-2 md:mt-0">
              <label
                htmlFor="itemsPerPage"
                className="mr-2 text-sm font-medium"
              >
                {t('Entries per page:')}
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

          {/* Counselings Table */}
          <Table hoverable={true} className="w-full">
            <Table.Head>
              <Table.HeadCell>{t('ID')}</Table.HeadCell>
              <Table.HeadCell>{t('Student Name')}</Table.HeadCell>
              <Table.HeadCell>{t('Campus')}</Table.HeadCell>
              <Table.HeadCell>{t('Complain')}</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {paginatedCounselings?.map((counseling) => (
                <Table.Row
                  key={counseling?._id}
                  className="bg-white dark:bg-gray-800"
                >
                  <Table.Cell>{counseling?._id}</Table.Cell>
                  <Table.Cell>{counseling?.student}</Table.Cell>
                  <Table.Cell>{counseling?.campus?.name || 'N/A'}</Table.Cell>
                  <Table.Cell>{counseling?.complain}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      {userRole === "admin" && (
                        <Link
                          to={`/admin/counselings/${counseling?._id}`}
                          className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>
                      )}
                      <Link
                        to={`/admin/counseling/${counseling?._id}/details`}
                        className="px-3 py-2 text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white focus:outline-none"
                      >
                        <i className="fa fa-eye"></i>
                      </Link>
                      {userRole === "admin" && (
                        <button
                          className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                          onClick={() =>
                            deleteCounselingHandler(counseling?._id)
                          }
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

export default ListStudentCounselings;
