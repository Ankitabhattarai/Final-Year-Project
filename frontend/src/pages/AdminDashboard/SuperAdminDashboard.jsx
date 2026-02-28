import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import superAdminService from '@/services/superAdminService';
import { Building2, Users, AlertCircle, CheckCircle, XCircle, ChevronRight, LayoutDashboard, Database, Loader2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import HospitalDetailModal from '@/components/admin/HospitalDetailModal';

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [pendingHospitals, setPendingHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsResp, pendingResp] = await Promise.all([
                superAdminService.getSystemStats(),
                superAdminService.getPendingHospitals()
            ]);

            if (statsResp.success) setStats(statsResp.data);
            if (pendingResp.success) setPendingHospitals(pendingResp.data);
        } catch (error) {
            console.error('Super Admin Dashboard error:', error);
            toast.error('Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (id, status) => {
        try {
            setProcessingId(id);
            const resp = await superAdminService.processHospitalRequest(id, status);
            if (resp.success) {
                toast.success(`Hospital request ${status} successfully`);
                setPendingHospitals(prev => prev.filter(h => h._id !== id));
                // Refresh stats
                const statsResp = await superAdminService.getSystemStats();
                if (statsResp.success) setStats(statsResp.data);
            }
        } catch (error) {
            console.error('Process request error:', error);
            toast.error('Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
                    <p className="text-slate-500 mt-2 font-medium italic">Global monitoring and platform management</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        label="Approved Hospitals"
                        value={stats?.totalHospitals}
                        icon={<Building2 className="text-blue-600" />}
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        label="Total Patients"
                        value={stats?.totalPatients}
                        icon={<Users className="text-emerald-600" />}
                        bgColor="bg-emerald-50"
                    />
                    <StatCard
                        label="Pending Requests"
                        value={stats?.pendingHospitals}
                        icon={<AlertCircle className="text-amber-600" />}
                        bgColor="bg-amber-50"
                    />
                    <StatCard
                        label="Platform Doctors"
                        value={stats?.totalDoctors}
                        icon={<Database className="text-purple-600" />}
                        bgColor="bg-purple-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pending Requests */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-xl font-bold text-slate-800">Hospital Onboarding Requests</h2>
                                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {pendingHospitals.length} Pending
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {pendingHospitals.length > 0 ? (
                                    pendingHospitals.map(hospital => (
                                        <div key={hospital._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">{hospital.name}</h3>
                                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                        <LayoutDashboard size={14} />
                                                        {hospital.address.city}, {hospital.address.state}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-2 font-mono">
                                                        Admin: {hospital.adminEmail}
                                                    </p>
                                                    <button
                                                        onClick={() => setSelectedHospital(hospital)}
                                                        className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        <Info size={12} />
                                                        View Full Application
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleProcessRequest(hospital._id, 'approved')}
                                                        disabled={processingId === hospital._id}
                                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-100 min-w-[100px] justify-center"
                                                    >
                                                        {processingId === hospital._id ? (
                                                            <Loader2 className="animate-spin" size={16} />
                                                        ) : (
                                                            <>
                                                                <CheckCircle size={16} />
                                                                Approve
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleProcessRequest(hospital._id, 'rejected')}
                                                        disabled={processingId === hospital._id}
                                                        className="flex items-center gap-2 bg-white hover:bg-rose-50 disabled:opacity-50 text-rose-600 border border-rose-200 font-bold py-2 px-4 rounded-xl text-sm transition-all min-w-[100px] justify-center"
                                                    >
                                                        <XCircle size={16} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Building2 size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">No pending requests</h3>
                                        <p className="text-slate-500">All hospital applications have been processed.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info / Links */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                            <h2 className="text-xl font-bold mb-4">Quick Insights</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Weekly Growth</p>
                                    <p className="text-2xl font-bold text-emerald-400">+12.5%</p>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Avg Patient Load</p>
                                    <p className="text-2xl font-bold text-blue-400">45/hr</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Management</h2>
                            <div className="space-y-3">
                                <ManagementLink to="/admin/system/hospitals" label="Manage All Hospitals" icon={<Building2 size={18} />} />
                                <ManagementLink to="/admin/system/patients" label="View All Patients" icon={<Users size={18} />} />
                                <ManagementLink to="/admin/system/settings" label="System Settings" icon={<Database size={18} />} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HospitalDetailModal
                hospital={selectedHospital}
                onClose={() => setSelectedHospital(null)}
                onProcess={handleProcessRequest}
            />
        </DashboardLayout>
    );
}

function StatCard({ label, value, icon, bgColor }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${bgColor}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{value !== undefined ? value : '...'}</h3>
                </div>
            </div>
        </div>
    );
}

function ManagementLink({ to, label, icon }) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group border border-slate-100"
        >
            <div className="flex items-center gap-3 font-bold text-slate-700 group-hover:text-blue-700">
                {icon}
                {label}
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 translate-x-0 group-hover:translate-x-1 transition-transform" />
        </Link>
    );
}
