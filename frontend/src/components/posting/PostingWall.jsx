import { Card, Button, Modal, Dropdown } from "flowbite-react";
import { useSelector } from 'react-redux';
import "react-quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import FileUpload from "../UploadFile";


import { useCreateAnnouncementMutation, useGetAnnouncementsQuery } from "../../redux/api/postingApi";

import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const staticPosts = [
    {
        id: 1,
        user: {
            name: "John Doe",
            profilePic: "https://via.placeholder.com/50"
        },
        content: "This is the first post. Welcome to the announcement wall!",
        files: [],
        date: "2023-10-01 10:00 AM",
        comments: []
    },
    {
        id: 2,
        user: {
            name: "Jane Smith",
            profilePic: "https://via.placeholder.com/50"
        },
        content: "Reminder: Submit your assignments by Friday.",
        files: ["https://via.placeholder.com/300"],
        date: "2023-10-02 11:30 AM",
        comments: []
    }
];

const PostingWall = () => {
    dayjs.extend(relativeTime)

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch } = useGetAnnouncementsQuery({ page, limit: 10 });
    
    const [hasMore, setHasMore] = useState(true);
    const [announcements, setAnnouncements] = useState([]);

    const [ createAnnouncement, { isLoading: isCreating, error: createError, isSuccess }] = useCreateAnnouncementMutation();

    const { user } = useSelector((state) => state.auth);

    const [newPost, setNewPost] = useState("");
    const [files, setFiles] = useState([]);
    const [editPostId, setEditPostId] = useState(null);
    const [editPostContent, setEditPostContent] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [comments, setComments] = useState({});

    useEffect(() => {
        if (data?.announcements) {
            if (page === 1) {
                setAnnouncements(data.announcements);
            } else {
                setAnnouncements(prev => [...prev, ...data.announcements]);
            }
            setHasMore(data.announcements.length === 8);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

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

    const handleEditPost = (id) => {
        const post = announcements.find((post) => post.id === id);
        setEditPostId(id);
        setEditPostContent(post.content);
    };

    const saveEditedPost = () => {
        setAnnouncements(announcements.map(post => post.id === editPostId ? { ...post, content: editPostContent } : post));
        setEditPostId(null);
    };

    const confirmDeletePost = (id) => {
        setPostToDelete(id);
        setShowDeleteModal(true);
    };

    const deletePost = () => {
        setAnnouncements(announcements.filter(post => post.id !== postToDelete));
        setShowDeleteModal(false);
        setPostToDelete(null);
    };

    const addComment = (postId, comment) => {
        if (!comment.trim()) return;
        setAnnouncements(announcements.map(post =>
            post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
        ));
        setComments({ ...comments, [postId]: "" });
    };

    return (
        <AdminLayout>
            <MetaData title={"Posting Wall"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold mb-6">Announcements</h2>
                    <Card className="mb-6 p-4 bg-gray-100">
                        <form onSubmit={handlePostSubmit}>
                            <ReactQuill theme="snow" value={newPost} onChange={setNewPost} placeholder="Write a new post..." className="mb-3" />
                            {/* <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="mb-3" /> */}
                            <FileUpload  isSubmitted={isSuccess} setFiles={setFiles} loading={isCreating}/>
                            <Button type="submit"   disabled={isCreating} className="mt-3 bg-blue-600 text-white">   
                                {isCreating ? "Posting..." : "Post"}
                            </Button>
                        </form>
                    </Card>
                    {announcements.map((post) => (
                        <Card key={post._id} className="mb-4 p-4 shadow-lg relative">
                            {/* Dropdown Button for Edit and Delete */}
                            <div className="absolute top-4 right-4">
                                <Dropdown
                                    label={<i className="fa fa-ellipsis-v text-gray-600 hover:text-gray-900 cursor-pointer"></i>}
                                    inline={true}
                                    arrowIcon={false}
                                    placement="left-start"
                                >
                                    <Dropdown.Item onClick={() => handleEditPost(post.id)}>Edit</Dropdown.Item>
                                    <Dropdown.Item onClick={() => confirmDeletePost(post.id)}>Delete</Dropdown.Item>
                                </Dropdown>
                            </div>

                            {/* Post Content */}
                            <div className="flex items-center space-x-3">
                                <img src={post?.userId?.avatar?.url} alt="Profile" className="w-10 h-10 rounded-full" />
                                <div>
                                    <h4 className="font-semibold">{post.userId.name}</h4>
                                    <span className="text-sm text-gray-600">{dayjs(post.createdAt).fromNow()}</span>
                                </div>
                            </div>
                            <div className="mt-3" dangerouslySetInnerHTML={{ __html: post.message }} />
                            <ul className='mt-6 list-none p-0 flex flex-wrap gap-5'>
                            {post.attachments.length > 0 && post.attachments.map((file, index) =>(
                                <li key={index}>
                                <div className="relative text-center">
                                    <img 
                                    src={file.url} 
                                    alt={file.public_id} 
                                    className='w-[100px] h-[100px] object-cover border'
                                    />
                                
                                </div>
                                </li>
                                // <img key={index} src={file?.url} alt="attachment" className="mt-2 w-full max-h-60 object-cover rounded-md" />
                            ))}
                            </ul>

                            {/* Comment Section */}
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={comments[post.id] || ""}
                                    onChange={(e) => setComments({ ...comments, [post.id]: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                                <Button className="mt-2 bg-blue-500 text-white" onClick={() => addComment(post.id, comments[post.id] || "")}>
                                    Comment
                                </Button>
                            </div>
                            <div className="mt-3">
                                {post.comments.map((comment, idx) => (
                                    <p key={idx} className="text-gray-700 border-t pt-2 mt-2">{comment}</p>
                                ))}
                            </div>
                        </Card>
                    ))}

                    {hasMore && (
                        <div className="text-center mt-4">
                            <Button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="bg-blue-600 text-white"
                            >
                                {isLoading ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default PostingWall;
