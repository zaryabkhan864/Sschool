import React, { useState, useEffect, useRef, useCallback } from 'react';

const FileUpload = ({setFiles, loading, isSubmitted}) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);


  useEffect(() => {
    if (fileInputRef?.current) {
     setPreviews([])
     fileInputRef.current.value = null
    }
  }, [isSubmitted]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);    
    // Generate previews
    const newPreviews = [];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setFiles(prevFiles => [...prevFiles, reader.result]);
        newPreviews.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        });
        if (newPreviews.length === selectedFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

const handleRemoveFile = useCallback((indexToRemove) => {
  setPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
}, [setFiles]);

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
        disabled={loading}
      />
      <label 
        htmlFor="fileInput" 
        className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Upload Files
      </label>

      {/* Display selected files with previews */}
      {!!previews?.length &&(<div>
        <ul className='mt-6 list-none p-0 flex flex-wrap gap-5'>
          {previews.map((file, index) => (
            <li key={index}>
              <div className="relative text-center">
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                  type="button"
                >
                  ×
                </button>
                {file.type.startsWith('image/') ? (
                  <img 
                    src={file.data} 
                    alt={file.name} 
                    className='w-[100px] h-[100px] object-cover border'
                  />
                ) : (
                  <div className="w-[100px] h-[100px] border border-gray-300 flex items-center justify-center mb-2">
                    {file.type || 'No preview available'}
                  </div>
                )}
                <div className="truncate">{truncateFileName(file.name, 10)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>)}
    </div>
  );
};

export default FileUpload;