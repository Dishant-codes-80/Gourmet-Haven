import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      // Don't redirect here - let React Router handle navigation
      // The ProtectedRoute component will redirect to login for protected routes
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
};

// Menu API
export const menuAPI = {
  getAll: () => apiClient.get('/menu'),
  create: (data) => apiClient.post('/menu', data),
  update: (id, data) => apiClient.put(`/menu/${id}`, data),
  delete: (id) => apiClient.delete(`/menu/${id}`),
};

// Ingredients API
export const ingredientsAPI = {
  getAll: () => apiClient.get('/ingredients'),
  create: (data) => apiClient.post('/ingredients', data),
  update: (id, data) => apiClient.put(`/ingredients/${id}`, data),
  delete: (id) => apiClient.delete(`/ingredients/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post('/orders', data),
  updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
  updatePayment: (id, paymentStatus, paymentMethod) =>
    apiClient.put(`/orders/${id}/payment`, { paymentStatus, paymentMethod }),
  updateNotes: (id, notes) => apiClient.put(`/orders/${id}/notes`, { notes }),
  delete: (id) => apiClient.delete(`/orders/${id}`),
  getBill: (id) => apiClient.get(`/orders/${id}/bill`, { responseType: 'blob' }),
  createRazorpayOrder: (amount) => apiClient.post('/orders/create-razorpay-order', { amount }),
  verifyRazorpayPayment: (paymentData) => apiClient.post('/orders/verify-razorpay-payment', paymentData),
};

// Reservations API
export const reservationsAPI = {
  create: (data) => apiClient.post('/reservations', data),
  getAll: () => apiClient.get('/reservations'), // admin-only
  updateStatus: (id, status) => apiClient.put(`/reservations/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/reservations/${id}`),
};

export default apiClient;
