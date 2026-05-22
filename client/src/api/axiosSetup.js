import axios from 'axios';

const api = axios.create({
  // This tells React: "Use the cloud URL if it exists, otherwise use localhost"
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

export default api;