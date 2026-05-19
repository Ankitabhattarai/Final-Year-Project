import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const patientDashboardService = {
    getHospitals: async () => {
        const response = await axios.get(`${API_BASE_URL}/patient-dashboard/hospitals`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getHospitalDepartments: async (hospitalId) => {
        const response = await axios.get(`${API_BASE_URL}/patient-dashboard/hospitals/${hospitalId}/departments`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getAvailableDoctors: async (hospitalId, deptName) => {
        const response = await axios.get(`${API_BASE_URL}/patient-dashboard/hospitals/${hospitalId}/departments/${deptName}/doctors`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getMyQueue: async () => {
        const response = await axios.get(`${API_BASE_URL}/patient-dashboard/my-queue`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    bookToken: async (bookingData) => {
        const response = await axios.post(`${API_BASE_URL}/patient-dashboard/book-token`, bookingData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getAiRecommendations: async (department, hospitalId) => {
        const response = await axios.get(`${API_BASE_URL}/ai/recommend?department=${department}&hospitalId=${hospitalId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getQuickSuggestion: async (hospitalId) => {
        const url = hospitalId 
            ? `${API_BASE_URL}/ai/quick-suggestion?hospitalId=${hospitalId}`
            : `${API_BASE_URL}/ai/quick-suggestion`;
        const response = await axios.get(url, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default patientDashboardService;
