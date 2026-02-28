import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const superAdminService = {
    // Hospital Management
    getPendingHospitals: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/system/hospitals/pending`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    processHospitalRequest: async (id, status) => {
        const response = await axios.put(`${API_BASE_URL}/admin/system/hospitals/${id}/status`, { status }, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getAllHospitals: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/system/hospitals`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Patient Management
    getAllPatients: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/system/patients`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // System Stats
    getSystemStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/system/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Public Registration
    applyHospital: async (hospitalData) => {
        const response = await axios.post(`${API_BASE_URL}/hospitals/apply`, hospitalData);
        return response.data;
    }
};

export default superAdminService;
