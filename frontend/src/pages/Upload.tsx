import React, { useState, useEffect, useRef } from 'react';
import { getPresignedUrl, uploadFile, registerCall, getStorageMode } from '../api';

type MessageType = 'info' | 'success' | 'error';

interface StatusMessage {
  text: string;
  type: MessageType;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [storageMode, setStorageMode] = useState<'local' | 's3'>('local');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check storage mode on component mount
    getStorageMode().then(setStorageMode).catch(console.error);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      setStatusMessage(null);
    } else {
      setStatusMessage({
        text: 'Please select an audio file',
        type: 'error'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatusMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setStatusMessage({ text: 'Getting upload URL...', type: 'info' });

    try {
      // 1. Get upload URL (works for both S3 and local)
      setUploadProgress(10);
      const { upload_url, s3_key } = await getPresignedUrl(file.name, file.type || 'audio/wav');
      
      setUploadProgress(30);
      setStatusMessage({
        text: storageMode === 's3' ? 'Uploading to S3...' : 'Uploading file...',
        type: 'info'
      });
      
      // 2. Upload file (handles both S3 and local storage)
      await uploadFile(upload_url, file, file.type || 'audio/wav', storageMode);
      setUploadProgress(70);

      setStatusMessage({ text: 'Registering call metadata...', type: 'info' });
      // 3. Register metadata
      await registerCall(s3_key, file.name);
      setUploadProgress(100);

      setStatusMessage({
        text: 'Upload successful! Your audio file has been uploaded and registered.',
        type: 'success'
      });
      
      // Reset after success
      setTimeout(() => {
      setFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setStatusMessage({
        text: 'Upload failed. Please check the console for details and try again.',
        type: 'error'
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="main-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Upload Audio Call</h1>
        <p className="dashboard-subtitle">Upload and manage your support call recordings</p>
      </div>

      <div className="storage-badge">
        <span className={`storage-badge-indicator ${storageMode}`}></span>
        <span>Storage: {storageMode.toUpperCase()}</span>
      </div>

      <div className="upload-card">
        <div
          ref={dropZoneRef}
          className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDropZoneClick}
        >
          <div className="drop-zone-icon">🎵</div>
          <div className="drop-zone-text">
            {file ? 'File Selected' : 'Drag & Drop Audio File'}
          </div>
          <div className="drop-zone-hint">
            {file 
              ? 'Click to select a different file'
              : 'or click to browse files (MP3, WAV, M4A, etc.)'
            }
          </div>
        </div>

          <input
          ref={fileInputRef}
            id="file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
          className="file-input"
          />

        {file && (
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatFileSize(file.size)}</div>
            </div>
            <button
              type="button"
              className="file-remove"
              onClick={handleRemoveFile}
              disabled={uploading}
            >
              Remove
            </button>
          </div>
        )}

        <div className={`progress-container ${uploading ? 'active' : ''}`}>
          <div className="progress-label">
            <span>Upload Progress</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>

        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            <span className="status-icon">
              {statusMessage.type === 'success' ? '✓' : statusMessage.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="upload-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <span>⏳</span>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>⬆️</span>
                  <span>Upload Call</span>
                </>
              )}
            </button>
            {file && !uploading && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRemoveFile}
              >
                Cancel
        </button>
            )}
          </div>
      </form>
      </div>
    </div>
  );
};

export default Upload;
