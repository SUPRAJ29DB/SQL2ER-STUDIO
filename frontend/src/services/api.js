import axios from 'axios';

const API_BASE_URL = window.electronAPI?.backendUrl || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'API Request Failed';
    console.error('[API Error]:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

