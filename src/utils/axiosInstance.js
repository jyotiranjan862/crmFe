
import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'http://localhost:5000/api',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		// Add more default headers if needed
	},
});

// Optional: Add interceptors for auth, logging, etc.
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Example: Attach token
//     // const token = localStorage.getItem('token');
//     // if (token) config.headers['Authorization'] = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default axiosInstance;
