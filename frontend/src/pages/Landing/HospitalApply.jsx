import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import superAdminService from '@/services/superAdminService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function HospitalApply() {
    const [formData, setFormData] = useState({
        name: '',
        adminEmail: '',
        registrationNumber: '',
        contact: {
            phone: '',
            email: '',
            website: ''
        },
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Nepal'
        }
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await superAdminService.applyHospital(formData);
            if (resp.success) {
                setSubmitted(true);
                toast.success('Application submitted successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Application Received!</h1>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        Thank you for your interest in joining Careline. Our team will review your application and contact you via <span className="text-blue-600 font-bold">{formData.adminEmail}</span> within 2-3 business days.
                    </p>
                    <Link to="/" className="mt-10 inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors">
                        Return to homepage <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white mb-6 shadow-xl shadow-blue-100">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Partner with Careline</h1>
                    <p className="text-slate-500 mt-4 text-xl font-medium max-w-2xl mx-auto">
                        Streamline your hospital's appointments and waiting times with our enterprise-grade management system.
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12">
                        {/* Basic Info */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">1</span>
                                General Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField
                                    label="Hospital Name"
                                    name="name"
                                    placeholder="Bir Hospital"
                                    required
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Admin Email (For contact)"
                                    name="adminEmail"
                                    type="email"
                                    placeholder="admin@hospital.com"
                                    required
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Registration Number"
                                    name="registrationNumber"
                                    placeholder="HOS-123456"
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Official Website"
                                    name="contact.website"
                                    placeholder="https://hospital.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* Contact Info */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">2</span>
                                Official Contact
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField
                                    label="Contact Phone"
                                    name="contact.phone"
                                    placeholder="+977 1-4223807"
                                    required
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Contact Email"
                                    name="contact.email"
                                    type="email"
                                    placeholder="info@hospital.com"
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {/* Address */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm">3</span>
                                Hospital Location
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="Street Address" name="address.street" placeholder="Kantipath" required onChange={handleChange} />
                                <InputField label="City" name="address.city" placeholder="Kathmandu" required onChange={handleChange} />
                                <InputField label="State / Province" name="address.state" placeholder="Bagmati" required onChange={handleChange} />
                                <InputField label="Zip Code" name="address.zipCode" placeholder="44600" required onChange={handleChange} />
                            </div>
                        </section>

                        <div className="pt-8 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold py-5 px-8 rounded-2xl text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Processing Application...
                                    </>
                                ) : (
                                    <>
                                        Submit Registration
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-slate-400 mt-6 text-sm font-medium">
                                By submitting, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, name, type = 'text', placeholder, required, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                required={required}
                onChange={onChange}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
            />
        </div>
    );
}
