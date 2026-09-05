// src/components/posting/Wall.jsx
//
// Announcements Wall — scoped to the currently-selected campus +
// academic year. Anyone can post either to the whole school, or to one
// specific class group. Students can only target their own class group
// (or the whole school) — every other role can post to any class group.
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementsQuery,
} from "../../redux/api/postingApi";
import { useGetClassGroupsQuery } from "../../redux/api/classGroupApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import AppPageHeader from "../layout/AppPageHeader";
import Loader from "../layout/Loader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";
import AppBadge from "../GUI/AppBadge";
import EmptyState from "../GUI/EmptyState";
import ConfirmationModal from "../GUI/ConfirmationModal";

const getFullName = (u) =>
  u ? `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.trim() : "";

const initials = (u) => {
  const name = getFullName(u);
  return name ? name.charAt(0).toUpperCase() : "?";
};

const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "just now";
};

// ============================================================
// Composer — the "who can post where" rules live here.
// ============================================================
const Composer = ({ userRole, onPosted }) => {
  const { t } = useTranslation();
  const isStudent = userRole === "student";

  const [message, setMessage] = useState("");
  const [scope, setScope] = useState("school"); // "school" | "class"
  const [classGroupSearch, setClassGroupSearch] = useState("");
  const [selectedClassGroup, setSelectedClassGroup] = useState(null); // {value,label} — staff only

  const { data: classGroupsData, isFetching: classGroupsLoading } = useGetClassGroupsQuery(
    { status: "active", paginate: "false", keyword: classGroupSearch },
    { skip: isStudent || classGroupSearch.length < 2 }
  );

  const classGroupOptions = useMemo(
    () =>
      (classGroupsData?.classGroups || []).map((g) => ({
        value: g._id,
        label: g.displayName || `${g.grade?.gradeName || ""} ${g.section || ""}`,
      })),
    [classGroupsData]
  );

  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error(t("Please write something before posting"));
    if (scope === "class" && !isStudent && !selectedClassGroup) {
      return toast.error(t("Please pick a class group to post to"));
    }

    const body = { message: message.trim() };
    if (scope === "class") {
      if (isStudent) {
        body.postToOwnClass = true;
      } else {
        body.classGroup = selectedClassGroup.value;
      }
    }

    try {
      await createAnnouncement(body).unwrap();
      setMessage("");
      setScope("school");
      setSelectedClassGroup(null);
      setClassGroupSearch("");
      toast.success(t("Posted"));
      onPosted?.();
    } catch (err) {
      toast.error(err?.data?.message || t("Error creating post"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 👇 Not using AppCard's `footer` prop here — with only two
          fields, its footer bar left a large empty gap above the Post
          button. The button now sits directly in the normal content
          flow instead, with just a thin top border to separate it. */}
      <AppCard title={t("Create a Post")} icon="fa-bullhorn">
        <AppInput
          label={t("Message")}
          type="textarea"
          rows={3}
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("Share an announcement...")}
          required
        />

        <div className="mt-4">
          <label className="text-[11px] font-semibold text-ink-600 uppercase">{t("Post To")}</label>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setScope("school")}
              className={`px-4 py-2 rounded-xl text-sm-custom font-medium border transition-colors ${
                scope === "school"
                  ? "bg-brand-500 text-white border-brand-500 shadow-button"
                  : "bg-surface-50 text-ink-700 border-surface-200 hover:bg-surface-100"
              }`}
            >
              <i className="fa fa-school mr-2"></i>
              {t("Whole School")}
            </button>
            <button
              type="button"
              onClick={() => setScope("class")}
              className={`px-4 py-2 rounded-xl text-sm-custom font-medium border transition-colors ${
                scope === "class"
                  ? "bg-brand-500 text-white border-brand-500 shadow-button"
                  : "bg-surface-50 text-ink-700 border-surface-200 hover:bg-surface-100"
              }`}
            >
              <i className="fa fa-users mr-2"></i>
              {isStudent ? t("My Class") : t("Specific Class Group")}
            </button>
          </div>

          {/* Staff-only: search + pick which class group */}
          {scope === "class" && !isStudent && (
            <div className="mt-3">
              {selectedClassGroup ? (
                <div className="flex items-center justify-between px-3 py-2 border border-surface-200 rounded-lg bg-surface-50 text-sm-custom">
                  <span>{selectedClassGroup.label}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClassGroup(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={classGroupSearch}
                    onChange={(e) => setClassGroupSearch(e.target.value)}
                    placeholder={t("Search for a class group...")}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm-custom focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  {classGroupSearch.length >= 2 && (
                    <ul className="mt-1 border border-surface-200 rounded-lg max-h-40 overflow-y-auto shadow-soft">
                      {classGroupsLoading && (
                        <li className="px-3 py-2 text-sm-custom text-ink-400">{t("Loading...")}</li>
                      )}
                      {!classGroupsLoading && classGroupOptions.length === 0 && (
                        <li className="px-3 py-2 text-sm-custom text-ink-400">{t("No class groups found")}</li>
                      )}
                      {classGroupOptions.map((opt) => (
                        <li
                          key={opt.value}
                          onClick={() => {
                            setSelectedClassGroup(opt);
                            setClassGroupSearch("");
                          }}
                          className="px-3 py-2 hover:bg-surface-100 cursor-pointer text-sm-custom"
                        >
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          {scope === "class" && isStudent && (
            <p className="text-xs-custom text-ink-400 mt-2">
              {t("This will post to your own class group only.")}
            </p>
          )}
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-surface-100">
          <AppButton
            type="submit"
            label={t("Post")}
            loadingLabel={t("Posting...")}
            isLoading={isLoading}
            icon="fa-paper-plane"
          />
        </div>
      </AppCard>
    </form>
  );
};

// ============================================================
// A single post in the feed
// ============================================================
const PostCard = ({ post, currentUserId, userRole, onDeleteClick }) => {
  const { t } = useTranslation();
  const isOwner = post.userId?._id === currentUserId;
  const canManage = isOwner || ["admin", "principal"].includes(userRole);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {post.userId?.avatar?.url ? (
            <img src={post.userId.avatar.url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm-custom">
              {initials(post.userId)}
            </div>
          )}
          <div>
            <p className="text-sm-custom font-semibold text-ink-900">{getFullName(post.userId) || t("Unknown")}</p>
            <div className="flex items-center gap-2 text-xs-custom text-ink-400">
              <span className="capitalize">{post.userId?.role}</span>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {post.classGroup ? (
          <AppBadge type="classGroup" value={post.classGroup.displayName} />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
            <i className="fa fa-school mr-1"></i>
            {t("Whole School")}
          </span>
        )}
      </div>

      <p className="text-sm-custom text-ink-700 mt-4 whitespace-pre-wrap leading-relaxed">{post.message}</p>

      {post.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {post.attachments.map((a) => (
            <a
              key={a.public_id}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs-custom text-brand-600 underline"
            >
              <i className="fa fa-paperclip mr-1"></i>
              {t("Attachment")}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
        <span className="text-xs-custom text-ink-400">
          <i className="fa fa-comment mr-1"></i>
          {post.comments?.length || 0} {t("comments")}
        </span>
        {canManage && (
          <button
            onClick={() => onDeleteClick(post._id)}
            className="text-xs-custom text-red-500 hover:text-red-700 font-medium"
          >
            <i className="fa fa-trash mr-1"></i>
            {t("Delete")}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Wall
// ============================================================
const Wall = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetAnnouncementsQuery(
    { page },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteAnnouncement, { isLoading: isDeleteLoading, isSuccess: deleteSuccess, error: deleteError }] =
    useDeleteAnnouncementMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message || t("Error loading the wall"));
    if (deleteError) toast.error(deleteError?.data?.message || t("Error deleting post"));
    if (deleteSuccess) {
      toast.success(t("Post deleted"));
      setShowModal(false);
      setSelectedPostId(null);
    }
  }, [error, deleteError, deleteSuccess, t]);

  const posts = data?.announcements || [];
  const totalPages = Math.max(Math.ceil((data?.filteredCount || 0) / (data?.resPerPage || 8)), 1);

  const handleDeleteClick = (id) => {
    setSelectedPostId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedPostId) deleteAnnouncement(selectedPostId);
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Wall")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <AppPageHeader
          title={t("Announcements Wall")}
          subtitle={t("Posts for the current campus and academic year")}
        />

        <Composer userRole={user?.role} onPosted={() => setPage(1)} />

        {posts.length === 0 ? (
          <EmptyState
            icon="bullhorn"
            title={t("Nothing posted yet")}
            message={t("Be the first to share something with the school or your class.")}
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?._id}
                userRole={user?.role}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <AppButton
              text={t("Previous")}
              icon="chevron-left"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            <span className="text-sm-custom text-ink-600">
              {t("Page")} {page} {t("of")} {totalPages}
            </span>
            <AppButton
              text={t("Next")}
              icon="chevron-right"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        )}
      </div>

      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        loading={isDeleteLoading}
        message={t("Are you sure you want to delete this post? This cannot be undone.")}
      />
    </AdminLayout>
  );
};

export default Wall;