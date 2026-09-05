import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  useGetEventsQuery,
  useGetEventStatsQuery,
  useDeleteEventMutation,
} from "../../redux/api/eventApi";

import AdminLayout from "../layout/AdminLayout";
import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { DataTableContainer } from "../GUI/DataTableContainer";
import AppButton from "../GUI/AppButton";
import AppInput from "../GUI/AppInput";
import ActionButtons from "../GUI/ActionButtons";
import FilterDropdown from "../GUI/FilterDropdown";
import EmptyState from "../GUI/EmptyState";
import TruncatedCell from "../GUI/TruncatedCell";
import AppBadge from "../GUI/AppBadge";
import SelectField from "../GUI/SelectField";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const ListEvents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [userRole, setUserRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [isPaidFilter, setIsPaidFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setCurrentPage(1), [isPaidFilter, dateFrom, dateTo]);

  const { data: statsData } = useGetEventStatsQuery(undefined, { refetchOnMountOrArgChange: true });

  const { data, isLoading, isFetching, error, refetch } = useGetEventsQuery(
    {
      page: currentPage,
      limit,
      keyword: searchTerm || undefined,
      isPaid: isPaidFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteEvent, { isLoading: isDeleteLoading, error: deleteError, isSuccess: deleteSuccess }] =
    useDeleteEventMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Something went wrong"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Failed to delete event"));
    if (deleteSuccess) {
      toast.success(t("Event deleted successfully"));
      setShowModal(false);
      setSelectedEventId(null);
      refetch();
    }
    if (user?.role === "admin") setUserRole("admin");
  }, [error, deleteError, deleteSuccess, user, t, refetch]);

  const rows = data?.events || [];
  const paginationMeta = data?.pagination || {
    total: data?.total ?? rows.length,
    page: currentPage,
    limit,
    totalPages: Math.max(Math.ceil((data?.total ?? rows.length) / limit), 1),
  };

  const stats = [
    { label: t("Total Events"), value: statsData?.stats?.total ?? 0, icon: "calendar-alt", color: "blue" },
    { label: t("Paid Events"), value: statsData?.stats?.paid ?? 0, icon: "dollar-sign", color: "green" },
    { label: t("Upcoming"), value: statsData?.stats?.upcoming ?? 0, icon: "clock", color: "purple" },
  ];

  const handleDeleteClick = (id) => {
    setSelectedEventId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedEventId) deleteEvent(selectedEventId);
  };

  const handleEdit = (id) => navigate(`/admin/events/${id}`);
  const handleView = (id) => navigate(`/admin/event/${id}/details`);

  const columns = [
    {
      header: t("Event"),
      width: "26%",
      minWidth: "220px",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.image?.url ? (
            <img src={row.image.url} alt="" className="h-9 w-9 rounded-lg object-cover border border-gray-200" />
          ) : (
            <div className="h-9 w-9 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
              <i className="fa fa-calendar text-xs"></i>
            </div>
          )}
          <TruncatedCell maxChars={30}>{row.eventName}</TruncatedCell>
        </div>
      ),
    },
    {
      header: t("Campus"),
      width: "14%",
      minWidth: "130px",
      render: (_, row) => row.campus?.name || "-",
    },
    { header: t("Venue"), width: "16%", minWidth: "150px", render: (_, row) => <TruncatedCell maxChars={28}>{row.venue}</TruncatedCell> },
    { header: t("Date"), width: "12%", minWidth: "120px", render: (_, row) => formatDate(row.date) },
    {
      header: t("Paid"),
      width: "10%",
      minWidth: "100px",
      render: (_, row) => <AppBadge type="booleanStatus" active={row.isPaid} />,
    },
    {
      header: t("Amount"),
      width: "10%",
      minWidth: "110px",
      render: (_, row) => (row.isPaid ? `${row.currency} ${Number(row.amount).toFixed(2)}` : "-"),
    },
    {
      header: t("Action"),
      width: "12%",
      minWidth: "140px",
      render: (_, row) => (
        <ActionButtons
          id={row._id}
          userRole={userRole}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          isDeleteLoading={isDeleteLoading}
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
        setIsPaidFilter("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
        setLimit(8);
      }}
    >
      <SelectField
        label={t("Type")}
        value={isPaidFilter}
        onChange={setIsPaidFilter}
        placeholder={t("All Events")}
        options={["true", "false"]}
        optionLabel={(v) => (v === "true" ? t("Paid") : t("Free"))}
      />
      <AppInput label={t("From")} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
      <AppInput label={t("To")} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
    </FilterDropdown>
  );

  const emptyState = (
    <EmptyState
      icon="calendar-alt"
      title={searchTerm ? t("No events found matching your search") : t("No events scheduled yet")}
      message={t("Create your first event to see it here.")}
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

  const addButton = userRole === "admin" ? (
    <AppButton onClick={() => navigate("/admin/event/new")} label={t("New Event")} icon="plus" />
  ) : null;

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Events")} />

      <div className="max-w-6xl mx-auto">
        <DataTableContainer
          title={t("Events")}
          subtitle={t("School events, both free and paid")}
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
          searchPlaceholder={t("Search by name, description, or venue...")}
          onRefresh={refetch}
          refreshButton={refreshButton}
          addButton={addButton}
          emptyState={emptyState}
          filters={filters}
          stats={stats}
          userRole={userRole}
          renderHeaderInfo={() => (
            <p className="text-sm-custom text-dark-light mt-1">
              <i className="fa fa-info-circle mr-2"></i>
              {t("Showing")}: {rows.length} {t("of")} {paginationMeta.total} {t("events")}
            </p>
          )}
          showSearch={true}
          showStats={true}
          showPagination={true}
        />
      </div>

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={isDeleteLoading}
        message={t("Are you sure you want to delete this event?")}
        title={t("Confirm Delete")}
      />
    </AdminLayout>
  );
};

export default ListEvents;
