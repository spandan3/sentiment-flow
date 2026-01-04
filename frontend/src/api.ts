import axios from 'axios';

const API_BASE_URL = '/api';

export interface Call {
  id: string;
  created_at: string;
  s3_key: string;
  status: string;
  original_filename: string;
  duration_sec?: number;
}

export interface PresignResponse {
  upload_url: string;
  s3_key: string;
}

export const getHealth = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
};

export const getPresignedUrl = async (filename: string, contentType: string): Promise<PresignResponse> => {
  const response = await axios.post(`${API_BASE_URL}/uploads/presign`, {
    filename,
    content_type: contentType,
  });
  return response.data;
};

export const registerCall = async (s3_key: string, original_filename: string): Promise<Call> => {
  const response = await axios.post(`${API_BASE_URL}/calls`, {
    s3_key,
    original_filename,
  });
  return response.data;
};

export const listCalls = async (): Promise<Call[]> => {
  const response = await axios.get(`${API_BASE_URL}/calls`);
  return response.data;
};

export const getStorageMode = async (): Promise<'local' | 's3'> => {
  const response = await axios.get(`${API_BASE_URL}/uploads/storage-mode`);
  return response.data.mode;
};

export const uploadToS3 = async (url: string, file: File, contentType: string) => {
  // S3 presigned URL upload (PUT request)
  await axios.put(url, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
};

export const uploadToLocal = async (url: string, file: File) => {
  // Local storage upload (POST request to backend)
  const formData = new FormData();
  formData.append('file', file);
  
  await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadFile = async (uploadUrl: string, file: File, contentType: string, storageMode: 'local' | 's3') => {
  if (storageMode === 's3') {
    await uploadToS3(uploadUrl, file, contentType);
  } else {
    await uploadToLocal(uploadUrl, file);
  }
};
