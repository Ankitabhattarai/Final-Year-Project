import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  hospitalAdminLogin: async (email, password, hospitalCode) => {
    const response = await axios.post(`${API_URL}/auth/hospital-admin-login`, { email, password, hospitalCode });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default authService;
