import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUploadFileMutation, useDeleteFileMutation } from '../redux/api/fileApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';


const FileUpload = ({setIsUploadingFile, setFiles, loading, isSubmitted}) => {
  const { t  } = useTranslation();
  
  const [previews, setPreviews] = useState([]);

  const [ uploadFile, { isLoading }] = useUploadFileMutation();
  const [ deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();


  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileInputRef?.current && isSubmitted) {
     setPreviews([])
     fileInputRef.current.value = null
    }
  }, [isSubmitted]);

  useEffect(() => {
    setIsUploadingFile(isDeleting)
  }, [isDeleting, setIsUploadingFile]);

  useEffect(() => {
    setIsUploadingFile(isLoading)
  }, [isLoading, setIsUploadingFile]);

  const handleFileChange = useCallback(async (event) => {
    const selectedFiles = Array.from(event.target.files); 

    const fileUploadPromises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const result = await uploadFile({files: [reader.result]});  
          if(result.data){
            resolve(result.data.uploadedAttachments);
          } else {
            toast.error("error uploading file.");
            resolve([]); // Resolve with an empty array on error
          }
        };
        reader.readAsDataURL(file);
      });
    });

    const uploadedFiles = await Promise.all(fileUploadPromises);
    const filesToUpload = uploadedFiles.flat(); // Flatten the array of arrays

    if(filesToUpload?.length){
      setFiles(prevFiles => [...prevFiles, ...filesToUpload]);
      setPreviews(prevPreviews => [...prevPreviews, ...filesToUpload]);
    }

  },[setFiles, uploadFile]);

  const handleRemoveFile = useCallback(async (indexToRemove) => {
    const fileToDelete = previews[indexToRemove]; // Get the file to delete
    const result =  await deleteFile({ file: fileToDelete }); // Call the deleteFile API with the file ID
    if(result.data){
      setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
      setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    }
    else{
      toast.error("Failed to remove file.")
    }
  }, [previews, deleteFile, setFiles]);

const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
        return `${fileName.substring(0, maxLength)}...`;
    }
    return fileName;
    };

  return (
    <div>
       <input 
        ref = {fileInputRef}
        type="file" 
        multiple 
        onChange={handleFileChange}
        style={{ display: 'none' }} 
        id="fileInput" 
        disabled={isLoading ||loading || isDeleting}
      />
      <label 
        htmlFor="fileInput" 
        className={`cursor-pointer px-4 py-2 ${isLoading || loading || isDeleting ? 'bg-blue-400' : 'bg-blue-500'} text-white rounded hover:${isLoading || loading || isDeleting ? 'bg-gray-500' : 'bg-blue-600'}`}
      >
        {t('uploadFile')}
      </label>

      {/* Display selected files with previews */}
      {!!previews?.length &&(<div>
        <ul className='mt-6 list-none p-0 flex flex-wrap gap-5'>
          {previews?.map((file, index) => (
            <li key={index}>
              <div className="relative text-center">
                <button
                  disabled={isLoading || loading|| isDeleting }
                  onClick={() => handleRemoveFile(index)}
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
                {file.name &&(
                  <div className="truncate">{truncateFileName(file.name, 10)}</div>)}
              </div>
            </li>
          ))}
        </ul>
      </div>)}
    </div>
  );
};

export default FileUpload;