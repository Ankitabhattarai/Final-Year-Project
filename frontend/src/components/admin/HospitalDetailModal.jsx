import React from 'react';
import { X, Building2, Mail, Phone, MapPin, Globe, Calendar, Hash, ShieldCheck, ShieldAlert, Clock, Database } from 'lucide-react';

export default function HospitalDetailModal({ hospital, onClose, onProcess }) {
    if (!hospital) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div
                className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="bg-slate-50 border-b border-slate-100 p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                            <Building2 size={40} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{hospital.name}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hospital.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    hospital.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>
                                    {hospital.status}
                                </span>
                                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                    <Calendar size={12} />
                                    Applied: {new Date(hospital.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-8 sm:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Column 1: Identity & Contact */}
                        <div className="space-y-10">
                            <DetailSection title="Registration Details" icon={<Hash size={18} />}>
                                <InfoItem label="Registration Number" value={hospital.registrationNumber || 'Not provided'} isCopyable />
                                <InfoItem label="Admin Email" value={hospital.adminEmail} isCopyable />
                                <InfoItem label="System Status" value={hospital.isActive ? 'Active' : 'Inactive'} color={hospital.isActive ? 'text-emerald-600' : 'text-amber-600'} />
                            </DetailSection>

                            <DetailSection title="Official Contact" icon={<Mail size={18} />}>
                                <InfoItem label="Contact Email" value={hospital.contact.email} icon={<Mail size={14} />} />
                                <InfoItem label="Phone Number" value={hospital.contact.phone} icon={<Phone size={14} />} />
                                <InfoItem label="Website" value={hospital.contact.website} icon={<Globe size={14} />} isLink href={hospital.contact.website} />
                            </DetailSection>
                        </div>

                        {/* Column 2: Location & Facilities */}
                        <div className="space-y-10">
                            <DetailSection title="Location" icon={<MapPin size={18} />}>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-slate-700 font-bold mb-1">{hospital.address.street}</p>
                                    <p className="text-slate-500 font-medium">{hospital.address.city}, {hospital.address.state} {hospital.address.zipCode}</p>
                                    <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-widest">{hospital.address.country}</p>
                                </div>
                            </DetailSection>

                            <DetailSection title="Platform Capacity" icon={<Database size={18} />}>
                                {hospital.capacity?.totalDoctors > 0 && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <CapacityItem label="Total Doctors" value={hospital.capacity.totalDoctors} color="bg-emerald-50 text-emerald-700" />
                                    </div>
                                )}
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {hospital.departments?.map((dept, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                            {dept.name}
                                        </span>
                                    ))}
                                    {(!hospital.departments || hospital.departments.length === 0) && (
                                        <p className="text-slate-400 text-sm font-medium italic">No departments configured yet.</p>
                                    )}
                                </div>
                            </DetailSection>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions Section */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {hospital.isActive ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                <ShieldCheck size={20} />
                                Verified Partner
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                                <ShieldAlert size={20} />
                                Verification Needed
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {hospital.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => onProcess(hospital._id, 'approved')}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-100"
                                >
                                    Approve Request
                                </button>
                                <button
                                    onClick={() => onProcess(hospital._id, 'rejected')}
                                    className="px-8 py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 font-black rounded-2xl text-sm transition-all"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {hospital.status !== 'pending' && (
                            <button
                                onClick={() => onProcess(hospital._id, hospital.status === 'approved' ? 'rejected' : 'approved')}
                                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all border ${hospital.status === 'approved'
                                    ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                                    : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                                    }`}
                            >
                                {hospital.status === 'approved' ? 'Revoke Partnership' : 'Re-Approve Partnership'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailSection({ title, icon, children }) {
    return (
        <div className="space-y-4">
            <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

function InfoItem({ label, value, isCopyable, isLink, href, icon, color }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400">{label}</label>
            <div className="flex items-center gap-2">
                {icon && <span className="text-slate-400">{icon}</span>}
                {isLink ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                        {value}
                    </a>
                ) : (
                    <p className={`text-sm font-bold ${color || 'text-slate-900'} ${isCopyable ? 'font-mono' : ''}`}>
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
}

function CapacityItem({ label, value, color }) {
    return (
        <div className={`${color} p-4 rounded-2xl border border-current border-opacity-10 text-center`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
}
