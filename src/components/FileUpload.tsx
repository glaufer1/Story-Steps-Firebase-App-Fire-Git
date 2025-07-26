import React, { useState, useRef } from 'react';
import { FileType, uploadFile, FileUploadError, formatFileSize } from '../services/fileUpload';
import './FileUpload.css';

interface FileUploadProps {
  userId: string;
  fileType: FileType;
  context: 'profile' | 'tour' | 'stop' | 'page' | 'menu' | 'header' | 'city';
  contextId?: string;
  maxSizeMB?: number;
  onUploadSuccess: (url: string, path: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
  buttonText?: string;
  acceptedFileTypes?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  userId,
  fileType,
  context,
  contextId,
  maxSizeMB,
  onUploadSuccess,
  onUploadError,
  className = '',
  buttonText = 'Upload File',
  acceptedFileTypes
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size)
      });
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      console.log('Starting upload:', {
        fileName: file.name,
        fileType,
        context,
        contextId
      });

      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const result = await uploadFile(file, {
        userId,
        fileType,
        context,
        contextId,
        maxSizeMB
      });

      console.log('Upload successful:', {
        url: result.url,
        path: result.path
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadSuccess(result.url, result.path);

      // Reset after successful upload
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);

    } catch (error) {
      console.error('Upload error details:', {
        error,
        file: file.name,
        type: file.type,
        size: formatFileSize(file.size)
      });

      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Provide more detailed error messages
      let errorMessage = 'Failed to upload file. Please try again.';
      if (error instanceof FileUploadError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          errorMessage = 'You do not have permission to upload files. Please check your login status.';
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = 'Storage quota exceeded. Please contact support.';
        } else if (error.message.includes('storage/canceled')) {
          errorMessage = 'Upload was canceled. Please try again.';
        } else if (error.message.includes('storage/invalid-argument')) {
          errorMessage = 'Invalid file. Please check the file and try again.';
        }
      }

      onUploadError(errorMessage);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      console.log('File dropped:', {
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size)
      });
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  return (
    <div 
      className={`file-upload-container ${className} ${uploading ? 'uploading' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {!uploading ? (
        <div className="upload-content">
          <button
            type="button"
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {buttonText}
          </button>
          <div className="upload-info">
            {selectedFile && (
              <p className="file-info">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
            <p className="upload-hint">or drag and drop file here</p>
            <p className="upload-hint">
              Accepted types: {acceptedFileTypes || 'all files'}
              {maxSizeMB && ` • Max size: ${maxSizeMB}MB`}
            </p>
          </div>
        </div>
      ) : (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="progress-text">{uploadProgress}% uploaded</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 