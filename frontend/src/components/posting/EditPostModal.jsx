import ReactQuill from "react-quill";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUploadFileMutation, useDeleteFileMutation } from '../../redux/api/fileApi';
import toast from 'react-hot-toast';

import { Modal, Button } from "flowbite-react";

const EditPostModal = ({
  show,
  onClose,
  onSave,
  selectedPost,
  loading,
  isSubmitted,
}) => {
  const [message, setMessage] = useState(selectedPost?.message | "");
  const [attachment, setAttachment] = useState(selectedPost?.attachments || []);
  const [isUploadingfile, setIsUploadingFile] = useState(false);

  const [key, setKey] = useState(1);
  const [imagePreviews, setImagePreviews] = useState(selectedPost?.attachments || []);

  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();


  const fileRef = useRef(null);


  useEffect(() => {
    if (fileRef?.current && isSubmitted) {
      setImagePreviews([])
      fileRef.current.value = null
    }
  }, [isSubmitted]);

  useEffect(() => {
    setIsUploadingFile(isDeleting)
  }, [isDeleting, setIsUploadingFile]);

  useEffect(() => {
    setIsUploadingFile(isLoading)
  }, [isLoading, setIsUploadingFile]);

  const onFileChange = useCallback(async (event) => {
    const selectedFiles = Array.from(event.target.files);

    const fileUploadPromises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const result = await uploadFile({ files: [reader.result] });
          if (result.data) {
            resolve(result.data.uploadedAttachments);
          } else {
            toast.error("Error uploading file.");
            resolve([]); // Resolve with an empty array on error
          }
        };
        reader.readAsDataURL(file);
      });
    });

    const uploadedFiles = await Promise.all(fileUploadPromises);
    const filesToUpload = uploadedFiles.flat(); // Flatten the array of arrays

    console.log(filesToUpload, "sssssssssss")
    if (filesToUpload?.length) {
      setAttachment(prevFiles => [...prevFiles, ...filesToUpload]);
      setImagePreviews(prevPreviews => [...prevPreviews, ...filesToUpload]);
      setKey(key + 1)
    }

  }, [key, setAttachment, uploadFile]);

  const onRemoveFile = useCallback(async (indexToRemove) => {
    const fileToDelete = imagePreviews[indexToRemove]; // Get the file to delete
    const result = await deleteFile({ file: fileToDelete }); // Call the deleteFile API with the file ID
    if (result.data) {
      setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
      setAttachment(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    }
    else {
      toast.error("Failed to remove file.")
    }
  }, [imagePreviews, deleteFile, setAttachment]);

  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
      return `${fileName.substring(0, maxLength)}...`;
    }
    return fileName;
  };

  useEffect(() => {
    if (show) {
      setMessage(selectedPost?.message)
      setAttachment(selectedPost?.attachments)
      setImagePreviews(attachment)
      setKey(key + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleUpdate = useCallback(() => {
    onSave(message, attachment)
  }, [onSave, message, attachment]);

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Edit Post</Modal.Header>
      <Modal.Body>
        {selectedPost && (<>
          <ReactQuill theme="snow" value={message} onChange={(e) => setMessage(e)} className="mb-3" />
          <div>
            <input
              ref={fileRef}
              type="file"
              multiple
              onChange={onFileChange}
              style={{ display: 'none' }}
              id="fileInput"
              disabled={isLoading || loading || isDeleting}
            />
            <label
              htmlFor="fileInput"
              className={`cursor-pointer px-4 py-2 ${isLoading || loading || isDeleting ? 'bg-blue-400' : 'bg-blue-500'} text-white rounded hover:${isLoading || loading || isDeleting ? 'bg-gray-500' : 'bg-blue-600'}`}
            >
              Upload Files
            </label>

            {/* Display selected files with imagePreviews */}
            {!!imagePreviews?.length && (<div key={key}>
              <ul key={key} className='mt-6 list-none p-0 flex flex-wrap gap-5'>
                {imagePreviews?.map((file, index) => (
                  <li key={index}>
                    <div className="relative text-center">
                      <button
                        disabled={isLoading || loading || isDeleting}
                        onClick={() => onRemoveFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                        type="button"
                      >
                        ×
                      </button>
                      <img
                        src={file.url}
                        alt={file.name || file.public_id}
                        className='w-[100px] h-[100px] object-cover border'
                      />
                      {file.name && (
                        <div className="truncate">{truncateFileName(file.name, 10)}</div>)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>)}
          </div>
        </>)
        }
      </Modal.Body>
      <Modal.Footer>
        <Button color="blue" onClick={handleUpdate} disabled={loading || isUploadingfile}>
          {loading ? "Updating..." : "Update"}
        </Button>
        <Button disabled={loading || isUploadingfile} color="grey" onClick={onClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal; 