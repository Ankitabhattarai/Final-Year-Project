import axios from 'axios';
import API_BASE_URL from './apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminService = {
    // USERS
    getAllUsers: async (params) => {
        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: getAuthHeader(),
            params
        });
        return response.data;
    },
    createUser: async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/admin/users`, userData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, userData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // HOSPITALS
    getAllHospitals: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/hospitals`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    createHospital: async (hospitalData) => {
        const response = await axios.post(`${API_BASE_URL}/admin/hospitals`, hospitalData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updateHospital: async (id, hospitalData) => {
        const response = await axios.put(`${API_BASE_URL}/admin/hospitals/${id}`, hospitalData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    deleteHospital: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/hospitals/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // DEPARTMENTS
    getAllDepartments: async () => {
        const response = await axios.get(`${API_BASE_URL}/admin/departments`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    addDepartment: async (deptData) => {
        // deptData should include hospitalId
        const response = await axios.post(`${API_BASE_URL}/admin/departments`, deptData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    updateDepartment: async (hospitalId, deptId, deptData) => {
        const response = await axios.put(`${API_BASE_URL}/admin/departments/${hospitalId}/${deptId}`, deptData, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    deleteDepartment: async (hospitalId, deptId) => {
        const response = await axios.delete(`${API_BASE_URL}/admin/departments/${hospitalId}/${deptId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // DASHBOARD
    getDashboardMetrics: async () => {
        const response = await axios.get(`${API_BASE_URL}/dashboard/metrics`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getPatientFlow: async (period = '7days') => {
        const response = await axios.get(`${API_BASE_URL}/dashboard/patient-flow`, {
            headers: getAuthHeader(),
            params: { period }
        });
        return response.data;
    },
    getDepartmentWaitTimes: async () => {
        const response = await axios.get(`${API_BASE_URL}/dashboard/department-wait-times`, {
            headers: getAuthHeader()
        });
        return response.data;
    },
    getQueueStatus: async () => {
        const response = await axios.get(`${API_BASE_URL}/dashboard/queue-status`, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default adminService;
