import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        if (formData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const resp = await authService.changePassword(formData.currentPassword, formData.newPassword);
            if (resp.success) {
                setSuccess(true);
                toast.success('Password changed successfully');
                // Update local user state
                refreshUser({ mustChangePassword: false });

                // Small delay to show success state
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-12 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Access Secured!</h1>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        Your password has been updated successfully. Redirecting you to your dashboard...
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6 flex items-center justify-center">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-xl mb-6 shadow-xl shadow-amber-50">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Security Update</h1>
                    <p className="text-slate-500 mt-2 font-medium italic">
                        Hi {user?.fullName || 'User'}, please set a new password for your account.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    placeholder="Enter temporary password"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="password"
                                    name="newPassword"
                                    required
                                    placeholder="Min. 6 characters"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    placeholder="Re-enter new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-4 px-8 rounded-xl text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 group mt-4"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full text-slate-400 hover:text-slate-600 font-bold text-sm text-center pt-2"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
