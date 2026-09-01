// component
// src/components/admin/fees/ListDues.jsx
//
// Companion screen to ListFees — instead of who owes money, this shows
// enrolled students who currently have nothing pending. Same table
// theme/pattern as ListFees and ListStudentEnrollement for consistency.

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetClearedDuesQuery } from "../../../redux/api/feesApi";

import AdminLayout from "../../layout/AdminLayout";
import MetaData from "../../layout/MetaData";
import { DataTableContainer } from "../../GUI/DataTableContainer";
import AppButton from "../../GUI/AppButton";
import FilterDropdown from "../../GUI/FilterDropdown";
import EmptyState from "../../GUI/EmptyState";
import TruncatedCell from "../../GUI/TruncatedCell";
import AppBadge from "../../GUI/AppBadge";
import PhoneLink from "../../GUI/PhoneLink";

const getFullName = (student) =>
  student
    ? `${student.firstName || ""} ${student.middleName ? student.middleName + " " : ""}${student.lastName || ""}`.trim()
    : "";

const ListDues = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [genderFilter, setGenderFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter]);

  const { data: countData } = useGetClearedDuesQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const { data, isLoading, isFetching, error, refetch } = useGetClearedDuesQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (user?.role === "admin") setUserRole("admin");
  }, [error, user, t]);

  const rows = data?.students || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [
    {
      label: t("Students With Dues Clear"),
      value: countData?.total ?? 0,
      icon: "check-circle",
      color: "green",
    },
  ];

  const columns = [
    {
      header: t("Student Name"),
      accessor: "name",
      width: "25%",
      minWidth: "200px",
      render: (_, row) => <TruncatedCell maxChars={35}>{getFullName(row)}</TruncatedCell>,
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "10%",
      minWidth: "100px",
      render: (value) => <AppBadge type="gender" value={value} />,
    },
    {
      header: t("Class Group"),
      accessor: "classGroup",
      width: "18%",
      minWidth: "150px",
      render: (_, row) => (
        <TruncatedCell maxChars={25}>
          {row.currentEnrollment?.classGroup?.displayName ||
            row.currentEnrollment?.classGroup?.grade?.gradeName ||
            "-"}
        </TruncatedCell>
      ),
    },
    {
      header: t("Phone Number"),
      width: "17%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.phoneNumber} />,
    },
    {
      header: t("Dues Status"),
      accessor: "duesStatus",
      width: "15%",
      minWidth: "120px",
      render: () => (
        <span className="px-2 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-600">
          {t("Cleared")}
        </span>
      ),
    },
    {
      header: t("Action"),
      accessor: "action",
      width: "15%",
      minWidth: "150px",
      render: (_, row) => (
        <AppButton
          label={t("View History")}
          icon="history"
          size="sm"
          onClick={() => navigate(`/finance/fees/Payment?studentId=${row._id}`)}
        />
      ),
    },
  ];

  const filters = (
    <FilterDropdown
      limit={limit}
      onLimitChange={(newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
      }}
      onReset={() => {
        setSearch("");
        setSearchTerm("");
        setCurrentPage(1);
        setLimit(8);
        setGenderFilter("");
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("Gender")}</label>
        <select
          value={genderFilter}
          onChange={(e) => {
            setGenderFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">{t("All Genders")}</option>
          <option value="male">{t("Male")}</option>
          <option value="female">{t("Female")}</option>
          <option value="other">{t("Other")}</option>
        </select>
      </div>
    </FilterDropdown>
  );

  const emptyState = (
    <EmptyState
      icon="hand-holding-usd"
      title={searchTerm || genderFilter ? t("No records found matching your search") : t("No students with cleared dues yet")}
      message={t("Once students pay off all pending fees, they'll show up here.")}
    />
  );

  const refreshButton = (
    <AppButton
      onClick={() => {
        refetch();
        toast.success(t("Refreshed"));
      }}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  if (isLoading) return null;

  return (
    <AdminLayout>
      <MetaData title={t("Dues Cleared")} />

      <DataTableContainer
        title={t("Dues Cleared")}
        subtitle={t("Enrolled students with no pending fee installments")}
        data={rows}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        pagination={paginationMeta}
        currentPage={paginationMeta.page}
        setCurrentPage={setCurrentPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder={t("Search students by name or phone...")}
        onRefresh={refetch}
        refreshButton={refreshButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderHeaderInfo={() => (
          <p className="text-sm-custom text-dark-light mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("students")}
          </p>
        )}
        className="dues-cleared-table-container bg-surface-50 shadow-soft rounded-xl"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default ListDues;
