import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import superAdminService from '@/services/superAdminService';
import { Building2, Search, MapPin, Phone, Globe, ShieldCheck, ShieldAlert, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import HospitalDetailModal from '@/components/admin/HospitalDetailModal';

export default function AdminHospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHospital, setSelectedHospital] = useState(null);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const resp = await superAdminService.getAllHospitals();
            if (resp.success) setHospitals(resp.data);
        } catch (error) {
            console.error('Fetch hospitals error:', error);
            toast.error('Failed to load hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (id, status) => {
        try {
            setProcessingId(id);
            const resp = await superAdminService.processHospitalRequest(id, status);
            if (resp.success) {
                toast.success(`Hospital ${status} successfully`);
                const hIndex = hospitals.findIndex(h => h._id === id);
                if (hIndex > -1) {
                    const updated = { ...hospitals[hIndex], status, isActive: status === 'approved' };
                    setHospitals(prev => prev.map(h => h._id === id ? updated : h));
                    if (selectedHospital?._id === id) setSelectedHospital(updated);
                }
            }
        } catch (error) {
            console.error('Process request error:', error);
            toast.error('Failed to update hospital status');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Hospitals</h1>
                        <p className="text-slate-500 mt-1 font-medium">Overview of all {hospitals.length} platform partners</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by hospital name..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-700 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHospitals.map((hospital) => (
                        <div
                            key={hospital._id}
                            onClick={() => setSelectedHospital(hospital)}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col cursor-pointer"
                        >
                            <div className="p-8 pb-0">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Building2 size={32} />
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${hospital.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                        hospital.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                            'bg-rose-50 text-rose-600'
                                        }`}>
                                        {hospital.status}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{hospital.name}</h3>
                                <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
                                    <MapPin size={14} />
                                    {hospital.address.city}, {hospital.address.state}
                                </p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <Phone size={14} />
                                        </div>
                                        <span className="text-sm font-bold">{hospital.contact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <Globe size={14} />
                                        </div>
                                        <span className="text-sm font-bold truncate">{hospital.contact.website || 'No website'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-8 pt-6">
                                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {hospital.isActive ? (
                                                <ShieldCheck className="text-emerald-500" size={18} />
                                            ) : (
                                                <ShieldAlert className="text-amber-500" size={18} />
                                            )}
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                {hospital.isActive ? 'System Active' : 'Access Restricted'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedHospital(hospital);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                        >
                                            View Full Details
                                        </button>
                                    </div>

                                    {hospital.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleProcessRequest(hospital._id, 'approved')}
                                                disabled={processingId === hospital._id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-100"
                                            >
                                                {processingId === hospital._id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleProcessRequest(hospital._id, 'rejected')}
                                                disabled={processingId === hospital._id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleProcessRequest(hospital._id, hospital.status === 'approved' ? 'rejected' : 'approved')}
                                            disabled={processingId === hospital._id}
                                            className={`w-full font-bold py-2 px-4 rounded-xl text-sm transition-all border ${hospital.status === 'approved'
                                                ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {hospital.status === 'approved' ? 'Revoke Access' : 'Re-approve Access'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredHospitals.length === 0 && (
                    <div className="p-20 text-center">
                        <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-lg font-bold text-slate-800">No hospitals registered</p>
                        <p className="text-slate-500">Wait for new applications or check your filters.</p>
                    </div>
                )}
            </div>

            <HospitalDetailModal
                hospital={selectedHospital}
                onClose={() => setSelectedHospital(null)}
                onProcess={handleProcessRequest}
            />
        </DashboardLayout>
    );
}
