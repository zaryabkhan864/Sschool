import { useState } from "react";
import { Card, Button, Modal, Dropdown } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
    const [posts, setPosts] = useState(staticPosts);
    const [newPost, setNewPost] = useState("");
    const [files, setFiles] = useState([]);
    const [editPostId, setEditPostId] = useState(null);
    const [editPostContent, setEditPostContent] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [comments, setComments] = useState({});

    const handleFileChange = (e) => {
        setFiles([...files, ...Array.from(e.target.files)]);
    };

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        const newPostData = {
            id: Date.now(),
            user: { name: "Admin", profilePic: "https://via.placeholder.com/50" },
            content: newPost,
            files: files.map(file => URL.createObjectURL(file)),
            date: new Date().toLocaleString(),
            comments: []
        };
        setPosts([newPostData, ...posts]);
        setNewPost("");
        setFiles([]);
    };

    const handleEditPost = (id) => {
        const post = posts.find((post) => post.id === id);
        setEditPostId(id);
        setEditPostContent(post.content);
    };

    const saveEditedPost = () => {
        setPosts(posts.map(post => post.id === editPostId ? { ...post, content: editPostContent } : post));
        setEditPostId(null);
    };

    const confirmDeletePost = (id) => {
        setPostToDelete(id);
        setShowDeleteModal(true);
    };

    const deletePost = () => {
        setPosts(posts.filter(post => post.id !== postToDelete));
        setShowDeleteModal(false);
        setPostToDelete(null);
    };

    const addComment = (postId, comment) => {
        if (!comment.trim()) return;
        setPosts(posts.map(post =>
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
                            <input type="file" multiple onChange={handleFileChange} className="mb-3" />
                            <Button type="submit" className="mt-3 bg-blue-600 text-white">Post</Button>
                        </form>
                    </Card>
                    {posts.map((post) => (
                        <Card key={post.id} className="mb-4 p-4 shadow-lg relative">
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
                                <img src={post.user.profilePic} alt="Profile" className="w-10 h-10 rounded-full" />
                                <div>
                                    <h4 className="font-semibold">{post.user.name}</h4>
                                    <span className="text-sm text-gray-600">{post.date}</span>
                                </div>
                            </div>
                            <div className="mt-3" dangerouslySetInnerHTML={{ __html: post.content }} />
                            {post.files.length > 0 && post.files.map((file, index) => (
                                <img key={index} src={file} alt="attachment" className="mt-2 w-full max-h-60 object-cover rounded-md" />
                            ))}

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
                </div>
            </div>
        </AdminLayout>
    );
};

export default PostingWall;
