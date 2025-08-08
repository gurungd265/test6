import axios from 'axios';

// VITE_API_BASE_URL=http://localhost:8080
const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const api=axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwtToken');
    const tokenType = localStorage.getItem('tokenType')||'Bearer';
    // console.log('Sending request to:', config.url);
    // console.log('Token:', token);
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
      // console.log('Authorization header set:', config.headers.Authorization);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {

    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized received. Token might be expired or invalid.");
      // 自動にログアウト
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('userEmail');

      alert("トークンが無効です。 もう一度ログインをお願いします。");

      window.dispatchEvent(new Event('storage'));
      // ログインページへ
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;