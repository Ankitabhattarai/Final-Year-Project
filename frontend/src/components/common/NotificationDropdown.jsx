import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import API_BASE_URL from '../../services/apiConfig';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const socketRef = useRef();
    const dropdownRef = useRef();

    useEffect(() => {
        // 1. Fetch existing notifications
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: getAuthHeader()
                });
                if (response.data.success) {
                    setNotifications(response.data.data);
                    setUnreadCount(response.data.data.filter(n => !n.isRead).length);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (user) {
            fetchNotifications();

            // 2. Setup Socket.io - Use base server URL
            const socketUrl = API_BASE_URL.replace('/api', '');
            socketRef.current = io(socketUrl);

            socketRef.current.on('connect', () => {
                if (user?.id) {
                    socketRef.current.emit('register', user.id);
                    console.log('Socket registered with ID:', user.id);
                } else {
                    console.warn('Socket connected but user.id is missing', user);
                }
            });

            socketRef.current.on('notification', (data) => {
                // Map id to _id if needed, and ensure structure match
                const normalizedNotification = {
                    ...data,
                    _id: data.id || data._id,
                    createdAt: data.createdAt || new Date().toISOString()
                };
                setNotifications(prev => [normalizedNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(data.title, {
                    description: data.message,
                });
            });
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: getAuthHeader()
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
                headers: getAuthHeader()
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'turn_alert': return <CheckCircle2 className="text-green-500" size={18} />;
            case 'appointment_update': return <AlertCircle className="text-blue-500" size={18} />;
            default: return <Info className="text-gray-500" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} New
                                </span>
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tight"
                                >
                                    Mark All Read
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => !n.isRead && markAsRead(n._id)}
                                    className={`p-4 border-b border-slate-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getIcon(n.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} text-slate-900`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="text-slate-400" size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50/50 text-center">
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
