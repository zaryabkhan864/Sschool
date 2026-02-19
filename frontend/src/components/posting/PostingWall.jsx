import { Dropdown } from "flowbite-react";
import { useSelector } from 'react-redux';
import "react-quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import FileUpload from "../UploadFile";
import Comment from './Comment';
import ConfirmationModal from './ConfirmationModal';
import EditPostModal from './EditPostModal';
import { useTranslation } from 'react-i18next';

import {
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation
} from "../../redux/api/postingApi";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation
} from "../../redux/api/commentApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const PostingWall = () => {
  const { t, i18n } = useTranslation();
  dayjs.extend(relativeTime);

  const [page, setPage] = useState(1);
  const { data, isLoading, refetch, isFetching } = useGetAnnouncementsQuery({ page, limit: 10 });

  const [hasMore, setHasMore] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const [createAnnouncement, { isLoading: isCreating, isSuccess }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeletingPost }] = useDeleteAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isEditingPost }] = useUpdateAnnouncementMutation();

  const [createComment, { isLoading: isAddingComment }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  const { user } = useSelector((state) => state.auth);

  const [files, setFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [comments, setComments] = useState({});
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);

  useEffect(() => {
    if (data?.announcements) {
      if (page === 1) {
        setAnnouncements(data.announcements);
      } else {
        setAnnouncements(prev => [...prev, ...data.announcements]);
      }
      setHasMore(data.announcements.length === 10);
    }
  }, [data, page]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostData = {
      userId: user?._id,
      message: newPost,
      attachments: files,
    };
    const result = await createAnnouncement(newPostData);
    if (result.data) {
      setPage(1);
      refetch();
      setNewPost("");
      setFiles([]);
      toast.success(t("Post created successfully"));
    }
  };

  const handleCommentSubmit = async (postId, comment) => {
    if (!comment.trim()) return;
    const result = await createComment({ userId: user?._id, message: comment, announcementId: postId });
    if (result.data) {
      refetch();
      setComments({ ...comments, [postId]: '' });
      toast.success(t("Comment added"));
    }
  };

  const updatePost = useCallback(async (message, files) => {
    if (!message.trim()) return;
    const result = await updateAnnouncement({ id: selectedPost._id, body: { attachments: files, message } });
    if (result.data) {
      setPage(1);
      refetch();
      setShowEditPostModal(false);
      setSelectedPost(null);
      toast.success(t("Announcement updated"));
    }
  }, [selectedPost, refetch, updateAnnouncement, t]);

  const confirmDeletePost = useCallback(async (postId) => {
    const result = await deleteAnnouncement(postId);
    if (result?.data) {
      setPage(1);
      refetch();
      toast.success(t("Post deleted"));
      setShowDeletePostModal(false);
    }
  }, [deleteAnnouncement, refetch, t]);

  const toggleComments = (postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
  };

  // UI Classes from NewGrade
  const primaryBtn = "bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all shadow-md disabled:bg-gray-400 disabled:shadow-none";
  const secondaryBtn = "px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm";
  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";

  return (
    <AdminLayout>
      <MetaData title={t("posting")} />

      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('Announcement Wall')}</h1>
            <p className="text-xs text-gray-500">{t('Share updates and interact with the community')}</p>
          </div>
        </div>

        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <form onSubmit={handlePostSubmit} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa fa-pen-fancy text-blue-500 text-xs"></i>
              <h3 className="font-bold text-[11px] text-gray-500 uppercase tracking-wider">{t('Create New Post')}</h3>
            </div>

            <div className="mb-4 border border-gray-100 rounded-lg overflow-hidden prose-sm">
              <ReactQuill
                key={i18n?.language}
                theme="snow"
                value={newPost}
                onChange={setNewPost}
                placeholder={t("What's on your mind?")}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <FileUpload
                setIsUploadingFile={setIsUploadingFile}
                isSubmitted={isSuccess}
                setFiles={setFiles}
                loading={isCreating}
              />
              <button
                type="submit"
                disabled={isCreating || isUploadingFile || !newPost.trim()}
                className={primaryBtn}
              >
                {isCreating ? <i className="fa fa-spinner fa-spin mr-1"></i> : <i className="fa fa-paper-plane mr-1 text-[10px]"></i>}
                <span>{t("Post")}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {announcements.map((post) => (
            <div key={post._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <img
                    src={post?.userId?.avatar?.url || "/images/default_avatar.jpg"}
                    alt="User"
                    className="w-9 h-9 rounded-full border border-gray-100 object-cover shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{post?.userId?.name}</h4>
                    <span className="text-[10px] font-medium text-gray-400 italic">
                      {dayjs(post?.createdAt).fromNow()}
                    </span>
                  </div>
                </div>

                {String(post?.userId?._id) === String(user?._id) && (
                  <Dropdown
                    label={<button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><i className="fa fa-ellipsis-v text-gray-400 text-xs"></i></button>}
                    inline={true}
                    arrowIcon={false}
                  >
                    <Dropdown.Item onClick={() => { setSelectedPost(post); setShowEditPostModal(true); }}>
                      <i className="fa fa-edit mr-2 text-blue-500"></i> {t('edit')}
                    </Dropdown.Item>
                    <Dropdown.Item className="text-red-600" onClick={() => { setSelectedPost(post); setShowDeletePostModal(true); }}>
                      <i className="fa fa-trash mr-2"></i> {t('delete')}
                    </Dropdown.Item>
                  </Dropdown>
                )}
              </div>

              {/* Post Content */}
              <div className="px-5 py-4">
                <div className="text-gray-700 text-[14.5px] leading-relaxed" dangerouslySetInnerHTML={{ __html: post?.message }} />

                {post?.attachments?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {post.attachments.map((file, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-gray-100 aspect-video bg-gray-50">
                        <img src={file.url} alt="attachment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions & Comments */}
              <div className="px-5 py-4 bg-gray-50/40 border-t border-gray-100">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder={t("Write a comment...")}
                    value={comments[post._id] || ""}
                    onChange={(e) => setComments({ ...comments, [post._id]: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    disabled={!comments[post._id] || isAddingComment}
                    onClick={() => handleCommentSubmit(post._id, comments[post._id])}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-sm"
                  >
                    {t("Post")}
                  </button>
                </div>

                <div className="space-y-3">
                  {post?.comments?.slice(0, expandedPosts.has(post._id) ? post.comments.length : 2).map((comment, idx) => (
                    <Comment
                      key={idx}
                      comment={comment}
                      currentUserId={user?._id}
                      postId={post?._id}
                      onDelete={() => refetch()} // Or pass specific delete handlers
                      onUpdateComment={() => refetch()}
                    />
                  ))}
                  {post.comments.length > 2 && (
                    <button onClick={() => toggleComments(post._id)} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                      {expandedPosts.has(post._id) ? t('Show Less') : `${t('View all')} ${post.comments.length} ${t('comments')}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <button onClick={loadMore} disabled={isFetching} className={secondaryBtn}>
              {isFetching ? <i className="fa fa-spinner fa-spin mr-2"></i> : null}
              {t('Load More Posts')}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmationModal
        show={showDeletePostModal}
        onConfirm={() => confirmDeletePost(selectedPost?._id)}
        loading={isDeletingPost}
        onClose={() => setShowDeletePostModal(false)}
        message={t("Are you sure you want to delete this post?")}
      />

      {selectedPost && (
        <EditPostModal
          show={showEditPostModal}
          onClose={() => { setShowEditPostModal(false); setSelectedPost(null); }}
          onSave={(message, files) => updatePost(message, files)}
          selectedPost={selectedPost}
          loading={isEditingPost}
        />
      )}
    </AdminLayout>
  );
};

export default PostingWall;