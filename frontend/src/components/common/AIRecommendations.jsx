import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, User, TrendingDown, AlertCircle } from 'lucide-react';
import patientDashboardService from '../../services/patientDashboardService';

const AIRecommendations = ({ department, hospitalId }) => {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (department && hospitalId) {
            fetchRecommendations();
        }
    }, [department, hospitalId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await patientDashboardService.getAiRecommendations(department, hospitalId);
            if (data.success) {
                setRecommendations(data.data);
            } else {
                setError('Failed to fetch recommendations');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error connecting to AI service');
        } finally {
            setLoading(false);
        }
    };

    if (!department || !hospitalId) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl p-6 shadow-xl shadow-indigo-50/50 transition-all hover:shadow-indigo-100/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Smart Recommendations</h2>
                </div>
                <button
                    onClick={fetchRecommendations}
                    disabled={loading}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    {loading ? 'Analyzing...' : 'Refresh AI'}
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Sparkles className="w-4 h-4 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm text-gray-500 animate-pulse font-medium">Predicting wait times across {department}...</p>
                </div>
            ) : error ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : recommendations?.recommended ? (
                <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl text-white shadow-lg shadow-indigo-200">
                        <div className="flex items-center gap-2 mb-2 text-indigo-100 uppercase tracking-wider text-[10px] font-bold">
                            <TrendingDown className="w-3 h-3" />
                            Quickest Appointment
                        </div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold mb-1">{recommendations.recommended.doctor_name}</h3>
                                <p className="text-sm text-indigo-100 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    {recommendations.recommended.specialization}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black">
                                    {recommendations.recommended.available_at || `${Math.round(recommendations.recommended.predicted_wait_min)}m`}
                                </div>
                                <div className="text-[10px] font-medium opacity-80 uppercase">
                                    {recommendations.recommended.available_at ? 'Available' : 'Est. Minutes'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Other Options</h4>
                        <div className="grid gap-3">
                            {recommendations.all_results
                                .filter(res => res.doctor_id !== recommendations.recommended.doctor_id)
                                .map((res, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-indigo-200 transition-all cursor-default group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">{res.doctor_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Patients ahead: {res.queue_length}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-sm">{res.available_at || `${Math.round(res.predicted_wait_min)}m`}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No alternate slots available for this department.</p>
                </div>
            )}
        </div>
    );
};

export default AIRecommendations;
