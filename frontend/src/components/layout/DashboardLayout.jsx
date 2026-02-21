import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Stethoscope,
    ShieldCheck,
    Ticket,
    FileText,
    Users,
} from 'lucide-react';

const patientNav = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

const doctorNav = [
    { label: 'Doctor Portal', path: '/doctor-dashboard', icon: <Stethoscope size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

const adminNav = [
    { label: 'Admin Dashboard', path: '/admin-dashboard', icon: <ShieldCheck size={20} /> },
    { label: 'Reports', path: '/admin/reports', icon: <FileText size={20} /> },
    { label: 'Token Kiosk', path: '/token-generate', icon: <Ticket size={20} /> },
    { label: 'Manage Users', path: '/admin-users', icon: <Users size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

export default function DashboardLayout({ children }) {
    const { user, role, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = role === 'admin' ? adminNav : role === 'doctor' ? doctorNav : patientNav;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="text-white" size={22} />
                        </div>
                        <span className="text-xl font-bold text-white">
                            Careline
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {React.cloneElement(item.icon, { size: 20 })}
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">
                                    {role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                {/* <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Pages</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-semibold capitalize">
                            {location.pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
                        </span>
                    </div>
                </header> */}

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
