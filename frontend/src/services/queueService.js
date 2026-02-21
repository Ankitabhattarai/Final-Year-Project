import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const queueService = {
    getQueueList: async (params) => {
        const response = await axios.get(`${API_BASE_URL}/queue`, {
            headers: getAuthHeader(),
            params
        });
        return response.data;
    },
    createQueueEntry: async (queueData) => {
        const response = await axios.post(`${API_BASE_URL}/queue`, queueData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updateQueueStatus: async (queueId, statusData) => {
        const response = await axios.put(`${API_BASE_URL}/queue/${queueId}/status`, statusData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updateQueueEntry: async (queueId, queueData) => {
        const response = await axios.put(`${API_BASE_URL}/queue/${queueId}`, queueData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    deleteQueueEntry: async (queueId) => {
        const response = await axios.delete(`${API_BASE_URL}/queue/${queueId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default queueService;
