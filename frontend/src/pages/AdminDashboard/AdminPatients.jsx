import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import superAdminService from '@/services/superAdminService';
import { Users, Search, Mail, Calendar, MapPin, Loader2 } from 'lucide-react';

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const resp = await superAdminService.getAllPatients();
            if (resp.success) setPatients(resp.data);
        } catch (error) {
            console.error('Fetch patients error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Patients</h1>
                        <p className="text-slate-500 mt-1 font-medium">Monitoring all {patients.length} registered users</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-700 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-left py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Details</th>
                                    <th className="text-left py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="text-left py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="text-left py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {patient.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{patient.fullName}</p>
                                                    <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">ID: {patient._id.substring(18)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {patient.email}
                                                </p>
                                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                                    <Users size={14} className="text-slate-400" />
                                                    {patient.profile?.phone || 'No phone'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                <MapPin size={14} className="text-slate-400" />
                                                {patient.profile?.address?.city || 'N/A'}, {patient.profile?.address?.state || 'Nepal'}
                                            </p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredPatients.length === 0 && (
                        <div className="p-20 text-center">
                            <Users size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-lg font-bold text-slate-800">No patients found</p>
                            <p className="text-slate-500">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
