import axios from 'axios';

// We create a custom "instance" of axios that already knows where our backend is.
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    // THIS IS THE MOST IMPORTANT LINE IN YOUR FRONTEND:
    // It tells the browser "Yes, please accept and send HTTP-only cookies!"
    withCredentials: true 
});

export default api;