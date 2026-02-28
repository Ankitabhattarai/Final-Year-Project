import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (err) {
                console.error('Failed to parse user from localStorage', err);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshUser = (newData) => {
        const updated = { ...user, ...newData, name: newData.fullName || newData.name };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    // Helper to match the role and name expectations in DashboardLayout
    // user in DB uses role 'hospital_admin', 'doctor', 'patient'
    // DashboardLayout expects 'admin' for hospital admins and user.name
    const role = user?.role;
    const normalizedUser = user ? { ...user, name: user.name || user.fullName } : null;

    return (
        <AuthContext.Provider value={{
            user: normalizedUser,
            role,
            login,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            isLoading: loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
