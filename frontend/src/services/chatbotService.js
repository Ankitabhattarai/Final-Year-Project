import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const chatbotService = {
    sendMessage: async (message, history = []) => {
        const response = await axios.post(`${API_BASE_URL}/chatbot/chat`, {
            message,
            history
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default chatbotService;
