import React, { createContext, useContext } from 'react';
import API_BASE_URL from '../services/apiConfig';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const apiFetch = async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }
        return data;
    };

    return (
        <ApiContext.Provider value={{ API_BASE_URL, apiFetch }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};
