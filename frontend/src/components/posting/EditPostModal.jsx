import React from 'react';
import ReactQuill from "react-quill";
import FileUpload from "../UploadFile";

import { Modal, Button } from "flowbite-react";

const EditPostModal = ({ show, onClose, onSave, selectedPost, setPostContent, loading, files, setFiles, isSubmitted }) => {
    return (
        
        <Modal show={show} onClose={onClose}>
            <Modal.Header>Edit Post</Modal.Header>
            <Modal.Body>
                {selectedPost && (<><ReactQuill theme="snow" value={selectedPost?.message} onChange={(e) => setPostContent((prev) => ({ ...prev, message: e }) )} placeholder="Write a new post..." className="mb-3" />
                <FileUpload  files={selectedPost?.attachments}  isSubmitted={isSubmitted} setFiles={setFiles} loading={loading}/>
   </>) }</Modal.Body>
            <Modal.Footer>
                <Button color="blue" onClick={onSave} disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                </Button>
                <Button  color="grey" onClick={onClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditPostModal; 