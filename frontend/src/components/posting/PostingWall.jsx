import { Card, Button, Dropdown } from "flowbite-react";
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

    dayjs.extend(relativeTime)

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch } = useGetAnnouncementsQuery({ page, limit: 10 });

    const [hasMore, setHasMore] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);

    const [createAnnouncement, { isLoading: isCreating, isSuccess }] = useCreateAnnouncementMutation();
    const [deleteAnnouncement, { isLoading: isDeletingPost }] = useDeleteAnnouncementMutation();
    const [updateAnnouncement, { isLoading: isEditingPost, isSuccess: isPostEdited }] = useUpdateAnnouncementMutation();

    const [createComment, { isLoading: isAddingComment }] = useCreateCommentMutation();
    const [deleteComment, { isLoading: isDeletingComment, isSuccess: deletingCommentSuccess }] = useDeleteCommentMutation();
    const [updateComment, { isLoading: isUpdatingComment, isSuccess: isCommentUpdated }] = useUpdateCommentMutation();

    const { user } = useSelector((state) => state.auth);

    const [files, setFiles] = useState([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [newPost, setNewPost] = useState("");
    const [updatedPost, setUpdatedPost] = useState(null);

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
            setHasMore(data.announcements.length === 8);
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
            toast.success("Announcement posted successfully.");
        } else {
            toast.error('Announcement failed to post.');
        }
    };

    const updatePost = useCallback(async (message, files) => {
        if (!message.trim()) return;
        const result = await updateAnnouncement({ id: updatedPost._id, body: { attachments: files, message } });
        if (result.data) {
            setPage(1);
            refetch();
            setShowEditPostModal(false);
            setUpdatedPost(null);
            toast.success("Announcement updated successfully.");
        } else {
            toast.error('Announcement failed to update.');
        }
    }, [updatedPost, refetch, updateAnnouncement]);

    const handleCommentSubmit = async (postId, comment) => {
        if (!comment.trim()) return;

        const newPostData = {
            userId: user?._id,
            message: comment,
            announcementId: postId
        };
        const result = await createComment(newPostData);
        if (result.data) {
            refetch();
            setComments({ ...comments, [postId]: '' });
            toast.success("Comment added successfully.");
        } else {
            toast.error('Comment failed to post.');
        }
    };

    const confirmDeleteComment = useCallback(async (commentId) => {
        const result = await deleteComment(commentId);
        if (result?.data) {
            refetch();
            toast.success("Comment deleted successfully.");
        } else {
            toast.error('Comment failed to delete.');
        }
    }, [deleteComment, refetch]);

    const handleUpdateComment = useCallback(async (commentId, newMessage) => {
        const result = await updateComment({ id: commentId, body: { message: newMessage } });
        if (result?.data) {
            refetch();
            toast.success("Comment updated successfully.");
        } else {
            toast.error('Comment failed to update.');
        }
    }, [refetch, updateComment]);

    const confirmDeletePost = useCallback(async (postId) => {
        const result = await deleteAnnouncement(postId);
        if (result?.data) {
            setPage(1);
            refetch();
            toast.success("Post deleted successfully.");
            setShowDeletePostModal(false);
        } else {
            toast.error('Post failed to delete.');
        }
    }, [deleteAnnouncement, refetch]);

    const toggleComments = (postId) => {
        setExpandedPosts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    return (
        <AdminLayout>
            <MetaData title={t("posting")} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full ">
                    <h2 className="text-2xl font-semibold mb-6">{t('posting')}</h2>
                    <Card className="mb-6 p-6 bg-white shadow-sm">
    <form onSubmit={handlePostSubmit} className="space-y-4">
        <ReactQuill
            key={i18n?.language}
            theme="snow"
            value={newPost}
            onChange={setNewPost}
            placeholder={t("newPost")}
            className="mb-4 border border-gray-300 rounded-lg"
        />

        {!showEditPostModal && (
            <div className="flex items-center justify-between">
                <FileUpload
                    setIsUploadingFile={setIsUploadingFile}
                    isSubmitted={isSuccess}
                    setFiles={setFiles}
                    loading={isCreating}
                />
                <Button
                    type="submit"
                    disabled={isCreating || isUploadingFile}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    {isCreating ? (
                        <>
                            <i className="fa fa-spinner fa-spin"></i>
                            {t("postLoading")}
                        </>
                    ) : (
                        <>
                            <i className="fa fa-paper-plane"></i>
                            {/* {t("post")} */}
                        </>
                    )}
                </Button>
            </div>
        )}
    </form>
</Card>
                    {announcements.map((post) => (
                        <Card key={post._id} className="mb-4 p-4 shadow-lg relative">
                            {/* Dropdown Button for Edit and Delete */}
                            {String(post?.userId._id) === String(user._id) && (
                                <div className="absolute top-4 right-4">
                                    <Dropdown
                                        label={<i className="fa fa-ellipsis-v text-gray-600 hover:text-gray-900 cursor-pointer"></i>}
                                        inline={true}
                                        arrowIcon={false}
                                        placement="left-start"
                                    >
                                        <Dropdown.Item onClick={() => {
                                            setUpdatedPost(post)
                                            setShowEditPostModal(true)
                                        }}>
                                            {t('edit')}
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => {
                                            setSelectedPost(post)
                                            setShowDeletePostModal(true)
                                        }}>
                                            {t('delete')}
                                        </Dropdown.Item>
                                    </Dropdown>
                                </div>)}

                            {/* Post Content */}
                            <div className="flex items-center space-x-3">
                                <img src={post?.userId?.avatar?.url || "/images/default_avatar.jpg"} alt="Profile" className="w-10 h-10 rounded-full" />
                                <div>
                                    <h4 className="font-semibold">{post?.userId?.name}</h4>
                                    <span className="text-sm text-gray-600">{dayjs(post?.createdAt).fromNow()}</span>
                                </div>
                            </div>
                            <div className="mt-3" dangerouslySetInnerHTML={{ __html: post?.message }} />
                            <ul className='mt-6 list-none p-0 flex flex-wrap gap-5'>
                                {post?.attachments.length > 0 && post?.attachments.map((file, index) => (
                                    <li key={index}>
                                        <div className="relative text-center">
                                            <img src={file.url} alt={file.public_id} className='w-[100px] h-[100px] object-cover border' />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder={t("placeholderComment")}
                                    value={comments[post.id] || ""}
                                    onChange={(e) => setComments({ ...comments, [post.id]: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                                <Button disabled={!comments[post.id] || isAddingComment} className="mt-2 bg-blue-500 text-white" onClick={() => handleCommentSubmit(post._id, comments[post.id] || "")}>
                                    {t("addComment")}
                                </Button>
                            </div>
                            <div className="mt-3 space-y-3">
                                {post?.comments.slice(
                                    expandedPosts.has(post._id) ? 0 : 0, expandedPosts.has(post._id) ? post.comments.length : 2
                                ).map((comment, idx) => (
                                    <Comment
                                        key={idx}
                                        comment={comment}
                                        currentUserId={user?._id}
                                        postId={post?._id}
                                        onDelete={confirmDeleteComment}
                                        onUpdateComment={handleUpdateComment}
                                        isCommentDeleted={deletingCommentSuccess}
                                        isDeletingComment={isDeletingComment}
                                        isCommentUpdated={isCommentUpdated}
                                        isUpdatingComment={isUpdatingComment}
                                    />
                                ))}
                                {post.comments.length > 2 && (
                                    <Button
                                        onClick={() => toggleComments(post._id)}
                                        size="xs"
                                        color="light"
                                        className="text-sm text-gray-600"
                                    >
                                        {expandedPosts.has(post._id)
                                            ? t('showLess')
                                            : `${t('show')} ${post.comments.length - 2} ${t('moreComments')}`}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                    {hasMore && (
                        <div className="flex justify-center mt-4">
                            <Button
                                onClick={loadMore}
                                disabled={isLoading}
                                size="xs"
                                className="bg-blue-600 text-white font-medium px-6 py-2"
                            >
                                {isLoading ? t("loading") : t('loadMore')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {updatedPost && (
                <EditPostModal
                    show={showEditPostModal && updatedPost}
                    onClose={() => {
                        if (!isEditingPost) {
                            setShowEditPostModal(false);
                            setUpdatedPost(null);
                        }
                    }}
                    onSave={(message, files) => updatePost(message, files)}
                    selectedPost={updatedPost}
                    loading={isEditingPost}
                    isSubmitted={isPostEdited}
                />
            )}
            <ConfirmationModal
                show={showDeletePostModal}
                onConfirm={() => confirmDeletePost(selectedPost._id)}
                loading={isDeletingPost}
                onClose={() => {
                    if (!isDeletingPost) {
                        setShowDeletePostModal(false);
                        setSelectedPost(null);
                    }
                }}
                message="Are you sure you want to delete this post? This action cannot be undone."
            />
        </AdminLayout>
    );
};

export default PostingWall;