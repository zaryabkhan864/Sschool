import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from "react-quill";
import FileUpload from "../UploadFile";

import { Modal, Button } from "flowbite-react";

const EditPostModal = ({
    show,
    onClose,
    onSave,
    selectedPost,
    loading,  
    isSubmitted,
    }) => {
        const [message, setMessage] = useState(selectedPost?.message|"");
        const [files, setFiles] = useState(selectedPost?.attachments|| []);
        const [isUploadingfile, setIsUploadingFile] = useState(false);

        useEffect(() => {
            if(show){ 
                setMessage(selectedPost?.message)
                setFiles(selectedPost?.attachments)
            }
          // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [show]);

          const handleUpdate = useCallback(() => {
            onSave(message,files)
          }, [onSave, message, files]);
    
    return (        
        <Modal show={show} onClose={onClose}>
            <Modal.Header>Edit Post</Modal.Header>
            <Modal.Body>
                {selectedPost && (<>
                    <ReactQuill theme="snow" value={message} onChange={(e) => setMessage(e)} className="mb-3" />
                    <FileUpload setIsUploadingFile={setIsUploadingFile} files={files}  isSubmitted={isSubmitted} setFiles={setFiles} loading={loading}/>
                </>)
                }
            </Modal.Body>
            <Modal.Footer>
                <Button color="blue" onClick={handleUpdate} disabled={loading || isUploadingfile}>
                    {loading ? "Updating..." : "Update"}
                </Button>
                <Button disabled={loading || isUploadingfile}  color="grey" onClick={onClose}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditPostModal; 