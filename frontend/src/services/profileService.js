import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const profileService = {
    getProfile: async () => {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updateProfile: async (profileData) => {
        const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    changePassword: async (passwordData) => {
        const response = await axios.put(`${API_BASE_URL}/profile/change-password`, passwordData, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default profileService;
