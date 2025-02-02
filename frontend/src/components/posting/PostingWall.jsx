import { useState } from "react";
import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { Card, Button, Modal } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill ka CSS import karein
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";

const staticPosts = [
    {
        id: 1,
        content: 'This is the first post. Welcome to the announcement wall!',
        files: [],
        date: '2023-10-01 10:00 AM',
    },
    {
        id: 2,
        content: 'Reminder: Submit your assignments by Friday.',
        files: ['https://via.placeholder.com/300'],
        date: '2023-10-02 11:30 AM',
    },
    {
        id: 3,
        content: 'New course material has been uploaded. Check it out!',
        files: [],
        date: '2023-10-03 09:15 AM',
    },
];

const PostingWall = () => {
    const [posts, setPosts] = useState(staticPosts);
    const [newPost, setNewPost] = useState("");
    const [files, setFiles] = useState([]);
    const [editPostId, setEditPostId] = useState(null);
    const [editPostContent, setEditPostContent] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);
    };

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        const newPostData = {
            id: Date.now(),
            content: newPost,
            files: files.map(file => URL.createObjectURL(file)),
            date: new Date().toLocaleString(),
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

    return (
        <AdminLayout>
            <MetaData title={"Posting Wall"} />
            <div className="flex justify-center items-center pt-5 pb-10">
                <div className="w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold mb-6">Announcements</h2>
                    <Card className="mb-6">
                        <form onSubmit={handlePostSubmit}>
                            <ReactQuill
                                theme="snow"
                                value={newPost}
                                onChange={setNewPost}
                                placeholder="Write a new post..."
                                className="mb-3"
                            />
                            <input type="file" multiple onChange={handleFileChange} className="mb-3" />
                            <div className="mt-2">
                                {files.length > 0 && files.map((file, index) => (
                                    <p key={index} className="text-sm text-gray-700">{file.name}</p>
                                ))}
                            </div>
                            <Button type="submit" className="mt-3 bg-blue-600 text-white">
                                Post
                            </Button>
                        </form>
                    </Card>
                    {posts.map((post) => (
                        <Card key={post.id} className="mb-4">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            {post.files.length > 0 && post.files.map((file, index) => (
                                <img key={index} src={file} alt="attachment" className="mt-2 w-full max-h-60 object-cover rounded-md" />
                            ))}
                            <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                                <span>{post.date}</span>
                                <div className="flex space-x-2">
                                    <Button
                                        className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                                        onClick={() => handleEditPost(post.id)}
                                    >
                                        <i className="fa fa-pencil"></i>
                                    </Button>
                                    <Button
                                        className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                                        onClick={() => confirmDeletePost(post.id)}
                                    >
                                        <i className="fa fa-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            {editPostId !== null && (
                <Modal show={true} onClose={() => setEditPostId(null)}>
                    <Modal.Header>Edit Post</Modal.Header>
                    <Modal.Body>
                        <ReactQuill
                            theme="snow"
                            value={editPostContent}
                            onChange={setEditPostContent}
                            className="mb-3"
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={saveEditedPost} className="bg-green-600 text-white">
                            Save
                        </Button>
                        <Button onClick={() => setEditPostId(null)} className="bg-gray-500 text-white">
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
            {showDeleteModal && (
                <Modal show={true} onClose={() => setShowDeleteModal(false)}>
                    <Modal.Header>Confirm Delete</Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this post?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={deletePost} className="bg-red-600 text-white">
                            Delete
                        </Button>
                        <Button onClick={() => setShowDeleteModal(false)} className="bg-gray-500 text-white">
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </AdminLayout>
    );
};

export default PostingWall;