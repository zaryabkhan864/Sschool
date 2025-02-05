import { Button, Dropdown, Textarea } from "flowbite-react";
import dayjs from "dayjs";
import { useState, useCallback, useEffect } from "react";
import ConfirmationModal from './ConfirmationModal';

const Comment = ({ 
    comment, 
    currentUserId,  
    onDelete, 
    onUpdateComment,
    isCommentDeleted,
    isDeletingComment,
    isUpdatingComment,
    isCommentUpdated,
}) => {
    const isCommentOwner = currentUserId === comment.userId?._id;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [commentMessage, updatedCommentMessage] = useState(comment?.message|| "");


    const handleDelete = useCallback(async () => {
        await onDelete(comment._id);
    }, [comment._id, onDelete]);

    const handleUpdate = useCallback(async () => {
        if(!commentMessage) return
        await onUpdateComment(comment._id, commentMessage);
    }, [comment._id, commentMessage, onUpdateComment]);

    useEffect(() => {
        if (isCommentDeleted) {
            setShowDeleteModal(false);
        }
    }, [isCommentDeleted]);

    useEffect(() => {
        if (isCommentUpdated) {
            setIsEditing(false);
        }
    }, [isCommentUpdated]);

    return (
        <div className="flex items-start space-x-3 border-t pt-3">
            <img 
                src={comment.userId?.avatar?.url || "https://via.placeholder.com/40"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">
                            {comment.userId?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500">
                            {dayjs(comment.createdAt).fromNow()}
                        </span>
                    </div>
                    {isCommentOwner && (
                        <>
                            <Dropdown
                                label={<i className="fa fa-ellipsis-v text-gray-600 hover:text-gray-900 cursor-pointer"></i>}
                                inline={true}
                                arrowIcon={false}
                            >
                                <Dropdown.Item onClick={() =>{
                                    setIsEditing(true)}}>
                                    Edit
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setShowDeleteModal(true)}>
                                    Delete
                                </Dropdown.Item>
                            </Dropdown>

                            <ConfirmationModal 
                                show={showDeleteModal} 
                                onClose={() => {if(!isDeletingComment) setShowDeleteModal(false)}} 
                                loading={isDeletingComment || isUpdatingComment}
                                onConfirm={handleDelete} 
                                message="Are you sure you want to delete this comment? This action cannot be undone." 
                            />
                        </>
                    )}
                </div>
                {isEditing ? (
                    <div className="mt-2">
                        <Textarea
                            type="text"
                            value={commentMessage}
                            onChange={(e) => updatedCommentMessage(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        <div className="mt-2 flex space-x-2">
                            <Button 
                                loading={isDeletingComment || isUpdatingComment}
                                size="xs" color="blue" onClick={() => handleUpdate()}>
                                Save
                            </Button>
                            <Button 
                                loading={isDeletingComment || isUpdatingComment}
                                size="xs" color="gray" onClick={()=>setIsEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 text-sm mt-1">{comment.message}</p>
                )}
            </div>
        </div>
    );
};

export default Comment; 