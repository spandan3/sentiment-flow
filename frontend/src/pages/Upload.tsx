import React, { useState, useEffect } from 'react';
import { getPresignedUrl, uploadFile, registerCall, getStorageMode } from '../api';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [storageMode, setStorageMode] = useState<'local' | 's3'>('local');

  useEffect(() => {
    // Check storage mode on component mount
    getStorageMode().then(setStorageMode).catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('Getting upload URL...');

    try {
      // 1. Get upload URL (works for both S3 and local)
      const { upload_url, s3_key } = await getPresignedUrl(file.name, file.type || 'audio/wav');
      
      setMessage(storageMode === 's3' ? 'Uploading to S3...' : 'Uploading file...');
      // 2. Upload file (handles both S3 and local storage)
      await uploadFile(upload_url, file, file.type || 'audio/wav', storageMode);

      setMessage('Registering call metadata...');
      // 3. Register metadata
      await registerCall(s3_key, file.name);

      setMessage('Upload successful!');
      setFile(null);
      // Reset file input
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload Call</h1>
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            id="file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default Upload;
