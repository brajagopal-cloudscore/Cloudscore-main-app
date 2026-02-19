import { errorToast } from '@/lib/utils/toast';
import { CircleX } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  files: File[] | null;
  uploadFiles: (files: FileList | null) => void;
  allowMulti: boolean;
  error?: string;
  maxFiles?: number;
  maxTotalSizeMB?: number;
}

const FileUploader = ({
  files,
  uploadFiles,
  allowMulti,
  error,
  maxFiles = 50,
  maxTotalSizeMB = 100,
}: Props) => {
  const allowedFormats = ['.pdf', '.txt', '.zip'];
  const [dragActive, setDragActive] = useState<boolean>(false);

  const validateFileTypes = (fileList: File[]): boolean => {
    // Check if all files have allowed extensions
    const invalidFiles = fileList.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedFormats.includes(extension);
    });
    
    if (invalidFiles.length > 0) {
      const extensions = invalidFiles.map(file => '.' + file.name.split('.').pop()?.toLowerCase());
      errorToast({ message: `Unsupported file format(s): ${Array.from(new Set(extensions)).join(', ')}` });
      return false;
    }
    
    return true;
  };

  // New function to validate total file size
  const validateTotalFileSize = (newFiles: File[], existingFiles: File[] = []): boolean => {
    const maxSizeBytes = maxTotalSizeMB * 1024 * 1024; // Convert MB to bytes
    
    // Calculate total size of all files (new + existing)
    const newFilesSize = Array.from(newFiles).reduce((total, file) => total + file.size, 0);
    const existingFilesSize = existingFiles.reduce((total, file) => total + file.size, 0);
    const totalSize = newFilesSize + existingFilesSize;
    
    if (totalSize > maxSizeBytes) {
      errorToast({ message: `You cannot upload more than ${maxTotalSizeMB} MB of files.` });
      return false;
    }
    
    return true;
  };

  const validateFiles = (fileList: FileList, existingFiles: File[] | null = files): boolean => {
    // Create arrays from the FileList for easier processing
    const newFilesArray = Array.from(fileList);
    const existingFilesArray = existingFiles || [];
    
    // First check if file types are valid
    if (!validateFileTypes(newFilesArray)) {
      return false;
    }
    
    // Check total file size
    if (!validateTotalFileSize(newFilesArray, existingFilesArray)) {
      return false;
    }
    
    // Check if we exceed max files when combining existing and new files
    if (allowMulti && existingFilesArray.length + newFilesArray.length > maxFiles) {
      errorToast({ message: `Maximum ${maxFiles} files allowed` });
      return false;
    }
    
    // Count ZIP files in the new selection
    const newZipFiles = newFilesArray.filter(file => 
      file.name.toLowerCase().endsWith('.zip')
    );
    
    // Count existing ZIP files
    const existingZipFiles = existingFilesArray.filter(file => 
      file.name.toLowerCase().endsWith('.zip')
    );
    
    // If we're trying to add more ZIP files and already have one
    if (newZipFiles.length > 0 && existingZipFiles.length > 0) {
      errorToast({ message: 'Only one ZIP file is allowed' });
      return false;
    }
    
    // If the new selection itself has multiple ZIP files
    if (newZipFiles.length > 1) {
      errorToast({ message: 'Only one ZIP file is allowed' });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    const newFiles = event.target.files;
    
    if (allowMulti) {
      // For multi-file mode, we want to append files, not replace them
      if (!validateFiles(newFiles)) return;
      
      // Combine existing files with new files
      const existingFiles = files || [];
      const combinedFiles = [...existingFiles, ...Array.from(newFiles)];
      
      // Create a new DataTransfer object to convert array back to FileList
      const dataTransfer = new DataTransfer();
      combinedFiles.forEach(file => dataTransfer.items.add(file));
      
      uploadFiles(dataTransfer.files);
    } else {
      // For single file mode, just replace the file
      if (!validateFiles(newFiles)) return;
      uploadFiles(newFiles);
    }
    
    // Clear the input to ensure onChange fires even if the same file is selected again
    event.target.value = '';
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = e.dataTransfer.files;
      
      if (allowMulti) {
        // For multi-file mode, we want to append files, not replace them
        if (!validateFiles(newFiles)) return;
        
        // Combine existing files with new files
        const existingFiles = files || [];
        const combinedFiles = [...existingFiles, ...Array.from(newFiles)];
        
        // Create a new DataTransfer object to convert array back to FileList
        const dataTransfer = new DataTransfer();
        combinedFiles.forEach(file => dataTransfer.items.add(file));
        
        uploadFiles(dataTransfer.files);
      } else {
        // For single file mode, just replace the file
        if (!validateFiles(newFiles)) return;
        uploadFiles(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    if (!files) return;
    
    const newFiles = [...files];
    newFiles.splice(index, 1);
    
    // Create a new DataTransfer object to convert array back to FileList
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    
    uploadFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null);
  };

  // Helper function to format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Calculate total size of all files
  const totalSize = files ? files.reduce((total, file) => total + file.size, 0) : 0;

  return (
    <div>
      <div
        className={`cursor-pointer border border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 min-h-52 transition duration-200 
          ${files && files.length > 0 && 'bg-blue-50 hover:bg-blue-50'} 
          ${error && 'bg-red-50 hover:bg-red-100 border-red-200'}
          ${dragActive && 'bg-blue-100 border-blue-400'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
          multiple={allowMulti}
          accept={allowedFormats.join(', ')}
        />
        {files && files.length > 0 ? (
          <>
            <div className="w-full">
              <div className="mb-2 text-center">
                <p className="font-medium">
                  {files.length} {files.length === 1 ? 'file' : 'files'} selected
                </p>
                <p className="text-sm text-gray-500">
                  Total size: {formatFileSize(totalSize)} / {maxTotalSizeMB} MB
                </p>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center py-1 px-2 my-1 bg-white rounded border border-gray-200">
                    <div className="flex flex-col truncate max-w-xs">
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <CircleX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <label
              htmlFor="fileInput"
              className="mt-4 underline text-blue-500 text-sm"
            >
              {allowMulti ? 'Add more files' : 'Change file'}
            </label>
          </>
        ) : (
          <>
            <label htmlFor="fileInput" className="text-gray-600 text-md">
              Drag & drop your {allowMulti ? 'files' : 'file'} here or{' '}
              <span className="text-blue-500">click</span> to upload
            </label>
            <p className="mt-2 text-gray-600 text-md">
              Supported formats{" "}
              <span className="font-semibold text-blue-600">PDF</span>,{" "}
              <span className="font-semibold text-blue-600">TXT</span>,{" "}
              <span className="font-semibold text-blue-600">ZIP</span> (max 1)
            </p>
            {allowMulti && (
              <div className="mt-1 text-sm text-gray-500 text-center">
                Maximum {maxFiles} files allowed (only one ZIP file)
                <div>Maximum total size: {maxTotalSizeMB} MB</div>
              </div>
            )}
          </>
        )}
      </div>
      {error && (
        <div className="mt-2 flex flex-row gap-2 items-center">
          <CircleX className="text-red-400" size={16} />
          <p className="text-red-500 text-sm mt-0">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
