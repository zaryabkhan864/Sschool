// component
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetStaffNeedingContractQuery,
  useGetEmployeeContractsQuery,
} from "../../redux/api/employeeContractApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import AppBadge from "../GUI/AppBadge";
import PhoneLink from "../GUI/PhoneLink";

const ListEmployeeContracts = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [genderFilter, setGenderFilter] = useState("");

  // ----- Side effects -----
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(t("Contract updated successfully!"));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, t, location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever a filter that changes the result set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genderFilter]);

  // ----- Queries -----
  // Lightweight, always-on "total" counts for the stats cards — these use
  // countOnly=true on the backend so they never pull the full staff /
  // contract lists, just a count.
  const {
    data: pendingCountData,
    error: pendingCountError,
    refetch: refetchPendingCount,
  } = useGetStaffNeedingContractQuery(
    { countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  const {
    data: terminatedCountData,
    error: terminatedCountError,
    refetch: refetchTerminatedCount,
  } = useGetEmployeeContractsQuery(
    { status: "terminated", countOnly: true },
    { refetchOnMountOrArgChange: true }
  );

  // 1) Staff needing a contract — server-side paginated + searched + filtered.
  // Only actually fetched while this tab is active.
  const {
    data: pendingData,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
    isFetching: pendingFetching,
  } = useGetStaffNeedingContractQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    {
      skip: statusFilter !== "pending",
      refetchOnMountOrArgChange: true,
    }
  );

  // 2) Terminated contracts — server-side paginated + searched + filtered.
  // Only actually fetched while this tab is active.
  const {
    data: terminatedData,
    isLoading: terminatedLoading,
    error: terminatedError,
    refetch: refetchTerminated,
    isFetching: terminatedFetching,
  } = useGetEmployeeContractsQuery(
    {
      status: "terminated",
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      gender: genderFilter || undefined,
    },
    {
      skip: statusFilter !== "terminated",
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (location.state?.shouldRefetch) {
      refetchPendingCount();
      refetchTerminatedCount();
      if (statusFilter === "pending") refetchPending();
      else refetchTerminated();
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (pendingError) toast.error(pendingError?.data?.message || t("Something went wrong"));
    if (terminatedError)
      toast.error(terminatedError?.data?.message || t("Something went wrong"));
    if (pendingCountError)
      toast.error(pendingCountError?.data?.message || t("Something went wrong"));
    if (terminatedCountError)
      toast.error(terminatedCountError?.data?.message || t("Something went wrong"));
    if (user?.role === "admin") setUserRole("admin");
  }, [pendingError, terminatedError, pendingCountError, terminatedCountError, user, t]);

  // ----- Helpers -----
  const handleRefresh = () => {
    refetchPendingCount();
    refetchTerminatedCount();
    if (statusFilter === "pending") refetchPending();
    else refetchTerminated();
    toast.success(t("Refreshed"));
  };

  const getFullName = (user) => {
    if (!user) return "";
    const { firstName = "", middleName = "", lastName = "" } = user;
    return `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
  };

  // ----- Build rows for the CURRENT tab only (already paginated/filtered by the backend) -----
  const staffNeeding = pendingData?.staff || [];
  const terminatedContracts = terminatedData?.contracts || [];

  let rows = [];
  if (statusFilter === "pending") {
    rows = staffNeeding.map((item) => ({
      id: item.user._id,
      name: getFullName(item.user),
      accountStatus: item.user.accountStatus,
      lifecycleStatus: item.user.lifecycleStatus,
      phoneNumber: item.user.phoneNumber,
      gender: item.user.gender,
      existingContract: item.existingContract,
      user: item.user,
      type: "pending",
    }));
  } else {
    rows = terminatedContracts.map((contract) => ({
      id: contract._id,
      name: getFullName(contract.employee),
      accountStatus: contract.employee?.accountStatus,
      lifecycleStatus: contract.employee?.lifecycleStatus,
      phoneNumber: contract.employee?.phoneNumber,
      gender: contract.employee?.gender,
      contractId: contract._id,
      type: "terminated",
    }));
  }

  // ----- Pagination meta (comes straight from the backend response) -----
  const activePagination =
    statusFilter === "pending" ? pendingData?.pagination : terminatedData?.pagination;
  const activeTotal =
    statusFilter === "pending"
      ? pendingData?.total ?? rows.length
      : terminatedData?.total ?? rows.length;

  const paginationMeta =
    activePagination || {
      total: activeTotal,
      page: currentPage,
      limit,
      totalPages: Math.max(Math.ceil(activeTotal / limit), 1),
    };

  // ----- Stats (independent of the active tab / pagination) -----
  const stats = [
    {
      label: t("Pending Contracts"),
      value: pendingCountData?.total ?? 0,
      icon: "clock",
      color: "orange",
    },
    {
      label: t("Terminated Contracts"),
      value: terminatedCountData?.total ?? 0,
      icon: "ban",
      color: "red",
    },
  ];

  // ----- Columns -----
  const columns = [
    {
      header: t("Teacher Name"),
      accessor: "name",
      width: "25%",
      minWidth: "200px",
      render: (_, row) => <TruncatedCell maxChars={35}>{row.name}</TruncatedCell>,
    },
    {
      header: t("Gender"),
      accessor: "gender",
      width: "10%",
      minWidth: "100px",
      render: (value) => <AppBadge type="gender" value={value} />,
    },
    {
      header: "Account Status",
      accessor: "accountStatus",
      width: "15%",
      minWidth: "120px",
      render: (value) => (
        <AppBadge type="accountStatus" value={value} />
      ),
    },
    {
      header: "Life Cycle Status",
      accessor: "lifecycleStatus",
      width: "15%",
      minWidth: "120px",
      render: (value) => (
        <AppBadge type="lifecycleStatus" value={value} />
      ),
    },
    {
      header: t("Phone Number"),
      width: "15%",
      minWidth: "150px",
      render: (_, row) => <PhoneLink number={row.phoneNumber} />,
    },
    {
      header: t("Action"),
      accessor: "action",
      width: "20%",
      minWidth: "150px",
      render: (_, row) => {
        if (row.type === "pending") {
          const existing = row.existingContract;
          return (
            <AppButton
              label={existing ? t("Update Contract") : t("Create Contract")}
              icon={existing ? "edit" : "plus"}
              onClick={() => {
                if (existing) {
                  navigate(`/admin/employee-contracts/edit?contractId=${existing._id}`);
                } else {
                  navigate(`/admin/employee-contracts/new?employeeId=${row.user._id}`);
                }
              }}
              size="sm"
            />
          );
        }
        return (
          <AppButton
            label={t("View")}
            icon="eye"
            onClick={() =>
              navigate(`/admin/employee-contracts/edit?contractId=${row.contractId}`)
            }
            size="sm"
          />
        );
      },
    },
  ];

  // ----- Filters (using custom typography & dark colors) -----
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
        setStatusFilter("pending");
        setGenderFilter("");
      }}
    >
      <div className="text-sm-custom text-dark-light flex flex-col sm:flex-row sm:items-center gap-2">
        <span>{t("Filter by status")}:</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm-custom"
        >
          <option value="pending">{t("Pending")}</option>
          <option value="terminated">{t("Terminated")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Gender")}
        </label>
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

  // ----- Empty state -----
  const emptyState = (
    <EmptyState
      icon="user-tie"
      title={
        searchTerm || genderFilter
          ? t("No records found matching your search")
          : statusFilter === "pending"
          ? t("All teachers have contracts")
          : t("No terminated contracts found")
      }
      message={
        statusFilter === "pending"
          ? t("No pending contracts for this campus and academic year.")
          : t("There are no terminated contracts.")
      }
    />
  );

  const isLoading = statusFilter === "pending" ? pendingLoading : terminatedLoading;
  const isFetching = statusFilter === "pending" ? pendingFetching : terminatedFetching;

  const addButton =
    userRole === "admin" ? (
      <AppButton to="/admin/employee-contracts/new" label={t("New Contract")} icon="plus" />
    ) : null;

  const refreshButton = (
    <AppButton
      onClick={handleRefresh}
      text={t("Refresh")}
      icon="sync-alt"
      disabled={isFetching}
      className="ml-2"
    />
  );

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Teacher Contracts")} />

      <DataTableContainer
        title={t("Teacher Contract Management")}
        subtitle={t("Manage contracts for teachers who need them")}
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
        searchPlaceholder={t("Search teachers...")}
        onRefresh={handleRefresh}
        refreshButton={refreshButton}
        addButton={addButton}
        emptyState={emptyState}
        filters={filters}
        stats={stats}
        userRole={userRole}
        renderHeaderInfo={() => (
          <p className="text-sm-custom text-dark-light mt-1">
            <i className="fa fa-info-circle mr-2"></i>
            {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("teachers")}
          </p>
        )}
        className="teacher-contract-table-container bg-surface-50 shadow-soft rounded-xl"
        showSearch={true}
        showStats={true}
        showPagination={true}
      />
    </AdminLayout>
  );
};

export default ListEmployeeContracts;
