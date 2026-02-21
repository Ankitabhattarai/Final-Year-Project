import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const doctorDashboardService = {
    getMyQueue: async () => {
        const response = await axios.get(`${API_BASE_URL}/doctor-dashboard/my-queue`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getDoctorStats: async () => {
        const response = await axios.get(`${API_BASE_URL}/doctor-dashboard/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updatePatientStatus: async (queueId, status, notes = '') => {
        const response = await axios.put(`${API_BASE_URL}/doctor-dashboard/queue/${queueId}/status`, 
            { status, notes },
            { headers: getAuthHeader() }
        );
        return response.data;
    }
};

export default doctorDashboardService;
