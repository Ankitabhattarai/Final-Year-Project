import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const patientService = {
    getAllPatients: async (params) => {
        const response = await axios.get(`${API_BASE_URL}/patients`, {
            headers: getAuthHeader(),
            params
        });
        return response.data;
    }
};

export default patientService;
