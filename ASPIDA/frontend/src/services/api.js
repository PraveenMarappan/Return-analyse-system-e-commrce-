import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('aspida_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('aspida_token');
      localStorage.removeItem('aspida_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    let message = 'An unexpected error occurred.';

    if (!error.response) {
      message = 'Unable to connect to ASPIDA server. Please make sure the backend is running.';
    } else if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.response.status === 500) {
      message = 'Login service is temporarily unavailable.';
    } else {
      message = error.message || message;
    }

    return Promise.reject(new Error(message));
  }
);

export default API;

