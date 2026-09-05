// src/components/posting/PostingWall.jsx
//
// Announcements Wall — scoped to the currently-selected campus +
// academic year. Anyone can post either to the whole school, or to one
// specific class group. Students can only target their own class group.
// Teachers can only target class groups whose courses they actually
// teach. Other staff (admin/principle/counselor) can post to any class
// group.
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
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
import SearchableDropdown from "../layout/SearchableDropdown";
import Comment from "./Comment";

// 👇 NEW: User model now exposes a `fullName` virtual (see backend/models/
// user.js) — computed from firstName/middleName/lastName. Only `initials`
// (a pure UI concern) and `timeAgo` (must be computed at render time, not
// baked into the API response, or it goes stale for anyone viewing later)
// stay on the frontend.
const initials = (u) => {
  const name = u?.fullName || "";
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
const Composer = ({ userRole, currentUserId, onPosted }) => {
  const { t } = useTranslation();
  const isStudent = userRole === "student";
  const isTeacher = userRole === "teacher";

  const [message, setMessage] = useState("");
  const [scope, setScope] = useState("school"); // "school" | "class"
  const [classGroupSearch, setClassGroupSearch] = useState("");
  const [classGroupId, setClassGroupId] = useState("");

  // 👇 For teachers specifically, only the class groups whose courses they
  // actually teach should show up — passing teacherId restricts the
  // backend query to that set (see classGroupController.js). Other staff
  // roles (admin/principle/counselor) still see every class group.
  const { data: classGroupsData, isFetching: classGroupsLoading } = useGetClassGroupsQuery(
    {
      status: "active",
      paginate: "false",
      keyword: classGroupSearch,
      ...(isTeacher && currentUserId ? { teacherId: currentUserId } : {}),
    },
    { skip: isStudent || classGroupSearch.length < 1 }
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

  const resetClassPicker = () => {
    setClassGroupId("");
    setClassGroupSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error(t("Please write something before posting"));
    if (scope === "class" && !isStudent && !classGroupId) {
      return toast.error(t("Please pick a class group to post to"));
    }

    const body = { message: message.trim() };
    if (scope === "class") {
      if (isStudent) {
        body.postToOwnClass = true;
      } else {
        body.classGroup = classGroupId;
      }
    }

    try {
      await createAnnouncement(body).unwrap();
      setMessage("");
      setScope("school");
      resetClassPicker();
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
          <label className="text-[11px] font-semibold text-ink-600 uppercase tracking-wider">
            {t("Post To")}
          </label>
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

          {/* Staff-only: search + pick which class group — same
              SearchableDropdown component used everywhere else in the app */}
          {scope === "class" && !isStudent && (
            <div className="mt-3">
              <SearchableDropdown
                value={classGroupId}
                onChange={setClassGroupId}
                onSearch={setClassGroupSearch}
                options={classGroupOptions}
                isLoading={classGroupsLoading}
                placeholder={t("Search for a class group...")}
                emptyMessage={
                  isTeacher
                    ? t("No class groups found for your courses")
                    : t("No class groups found")
                }
                clearable
              />
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
// Class group filter — lets staff narrow the feed down to one class
// group's posts instead of everything mixed together. Teachers only see
// class groups whose courses they actually teach (same restriction as
// the Composer); other staff (admin/principle/counselor) see every
// active class group. Not shown to students — they already only see
// whole-school posts plus their own class group's posts.
// ============================================================
const ClassGroupFilter = ({ userRole, currentUserId, value, onChange }) => {
  const { t } = useTranslation();
  const isTeacher = userRole === "teacher";
  const [search, setSearch] = useState("");

  const { data, isFetching } = useGetClassGroupsQuery(
    {
      status: "active",
      paginate: "false",
      keyword: search,
      ...(isTeacher && currentUserId ? { teacherId: currentUserId } : {}),
    },
    { skip: search.length < 1 }
  );

  const options = useMemo(
    () =>
      (data?.classGroups || []).map((g) => ({
        value: g._id,
        label: g.displayName || `${g.grade?.gradeName || ""} ${g.section || ""}`,
      })),
    [data]
  );

  return (
    <div className="w-full sm:w-72">
      <SearchableDropdown
        value={value}
        onChange={onChange}
        onSearch={setSearch}
        options={options}
        isLoading={isFetching}
        placeholder={t("Filter by class group...")}
        emptyMessage={
          isTeacher ? t("No class groups found for your courses") : t("No class groups found")
        }
        showSelected={false}
        clearable
      />
    </div>
  );
};

// ============================================================
// Comments — list of existing comments (via the Comment.jsx component)
// plus a small form to add a new one. Comments arrive already attached
// to each announcement (Announcement model's virtual `comments` populate),
// so posting/editing/deleting just invalidates the "Announcement" tag to
// pull the refreshed list back down.
// ============================================================
const CommentsSection = ({ post, currentUserId, t }) => {
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [updateComment, { isLoading: isUpdatingComment, isSuccess: isCommentUpdated }] =
    useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment, isSuccess: isCommentDeleted }] =
    useDeleteCommentMutation();

  const comments = post.comments || [];

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment({
        announcementId: post._id,
        message: newComment.trim(),
        userId: currentUserId,
      }).unwrap();
      setNewComment("");
    } catch (err) {
      toast.error(err?.data?.message || t("Error posting comment"));
    }
  };

  const handleDeleteComment = async (commentId) => {
    setActiveCommentId(commentId);
    try {
      await deleteComment(commentId).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || t("Error deleting comment"));
    }
  };

  const handleUpdateComment = async (commentId, message) => {
    setActiveCommentId(commentId);
    try {
      await updateComment({ id: commentId, message }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || t("Error updating comment"));
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-surface-100 space-y-3">
      {comments.map((c) => (
        <Comment
          key={c._id}
          comment={c}
          currentUserId={currentUserId}
          onDelete={handleDeleteComment}
          onUpdateComment={handleUpdateComment}
          isCommentDeleted={activeCommentId === c._id && isCommentDeleted}
          isDeletingComment={activeCommentId === c._id && isDeletingComment}
          isUpdatingComment={activeCommentId === c._id && isUpdatingComment}
          isCommentUpdated={activeCommentId === c._id && isCommentUpdated}
        />
      ))}

      <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t("Write a comment...")}
          className="flex-1 px-3 py-2 text-sm-custom border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          type="submit"
          disabled={isAdding || !newComment.trim()}
          className="w-9 h-9 flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <i className="fa fa-paper-plane text-xs-custom"></i>
        </button>
      </form>
    </div>
  );
};

// ============================================================
// A single post in the feed
// ============================================================
const PostCard = ({ post, currentUserId, userRole, onDeleteClick }) => {
  const { t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const isOwner = post.userId?._id === currentUserId;
  const canManage = isOwner || ["admin", "principle"].includes(userRole);
  const commentCount = post.comments?.length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-5 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {post.userId?.avatar?.url ? (
            <img src={post.userId.avatar.url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm-custom flex-shrink-0 shadow-soft">
              {initials(post.userId)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm-custom font-semibold text-ink-900 truncate">
              {post.userId?.fullName || t("Unknown")}
            </p>
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
          <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100 flex-shrink-0">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-50 border border-surface-200 rounded-lg text-xs-custom text-brand-600 hover:bg-surface-100 transition-colors"
            >
              <i className="fa fa-paperclip"></i>
              {t("Attachment")}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="text-xs-custom text-ink-400 hover:text-brand-600 font-medium transition-colors"
        >
          <i className="fa fa-comment mr-1"></i>
          {commentCount} {t("comments")}
        </button>
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

      {showComments && <CommentsSection post={post} currentUserId={currentUserId} t={t} />}
    </div>
  );
};

// ============================================================
// Main Wall
// ============================================================
const Wall = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const isStudent = user?.role === "student";

  // 👇 NEW: teacher/principle/counselor MUST pick a specific class group
  // before any posts are shown — otherwise every class's posts would be
  // mixed together with no way to tell which class a post belongs to.
  // Admin is exempt and still sees everything by default.
  const requiresClassFilter = ["teacher", "principle", "counselor"].includes(user?.role);

  const [page, setPage] = useState(1);
  const [filterClassGroupId, setFilterClassGroupId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const shouldSkipFetch = requiresClassFilter && !filterClassGroupId;

  const { data, isLoading, isFetching, error, refetch } = useGetAnnouncementsQuery(
    { page, classGroup: filterClassGroupId || undefined },
    { refetchOnMountOrArgChange: true, skip: shouldSkipFetch }
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

  const handleFilterChange = (id) => {
    setFilterClassGroupId(id);
    setPage(1);
  };

  if (isLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Wall")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl-custom font-bold text-ink-900 font-heading">
                {t("Announcements Wall")}
              </h1>
              <p className="text-sm-custom text-ink-400 mt-1">
                {requiresClassFilter
                  ? t("Select a class group below to view its posts")
                  : t("Posts for the current campus and academic year")}
              </p>
            </div>
            {!isStudent && (
              <ClassGroupFilter
                userRole={user?.role}
                currentUserId={user?._id}
                value={filterClassGroupId}
                onChange={handleFilterChange}
              />
            )}
          </div>
        </div>

        <Composer userRole={user?.role} currentUserId={user?._id} onPosted={() => setPage(1)} />

        {shouldSkipFetch ? (
          <EmptyState
            icon="filter"
            title={t("Select a class group to view its posts")}
            message={t("Choose a class group from the filter above to see announcements for that class.")}
          />
        ) : posts.length === 0 ? (
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

        {!shouldSkipFetch && totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-4">
            <div className="flex justify-center items-center gap-3">
              <AppButton
                text={t("Previous")}
                icon="chevron-left"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <span className="text-sm-custom text-ink-600 font-medium">
                {t("Page")} {page} {t("of")} {totalPages}
              </span>
              <AppButton
                text={t("Next")}
                icon="chevron-right"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </div>
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