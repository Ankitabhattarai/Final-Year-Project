import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Clock, Activity, CheckCircle, Loader2, RefreshCw, Ticket, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import doctorDashboardService from '@/services/doctorDashboardService';

const patientFlowData = [
    { month: 'Sep', scheduled: 120, attended: 110 },
    { month: 'Oct', scheduled: 150, attended: 142 },
    { month: 'Nov', scheduled: 180, attended: 170 },
    { month: 'Dec', scheduled: 200, attended: 185 },
    { month: 'Jan', scheduled: 220, attended: 210 },
    { month: 'Feb', scheduled: 250, attended: 235 },
];

export default function DoctorDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({ totalPatientsToday: 0, completed: 0, waiting: 0, noShow: 0, weeklyTrend: [] });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [qResp, sResp] = await Promise.all([
                doctorDashboardService.getMyQueue(),
                doctorDashboardService.getDoctorStats()
            ]);
            setQueue(qResp.data || []);
            setStats(sResp.data || { totalPatientsToday: 0, completed: 0, waiting: 0, noShow: 0, weeklyTrend: [] });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (queueId, newStatus) => {
        try {
            setSubmitting(true);
            await doctorDashboardService.updatePatientStatus(queueId, newStatus);
            await fetchDashboardData();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const nowServing = queue.find((t) => t.status === 'in_progress');
    const upcoming = queue.filter((t) => t.status === 'waiting');

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your patient queue and review current status.</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-gray-200"
                    >
                        <RefreshCw size={18} className={submitting ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Users size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Patients Today</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.totalPatientsToday}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <CheckCircle size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Activity size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Waiting</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.waiting}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Now Serving */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Now Serving</h2>
                            <p className="text-xs text-gray-500 mt-1">Current patient being attended</p>
                        </div>

                        {nowServing ? (
                            <div>
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Token</p>
                                            <p className="text-xl font-bold text-blue-600 font-mono">{nowServing.tokenNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Patient</p>
                                            <p className="text-xl font-semibold text-gray-900">{nowServing.patientId?.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Patient ID</p>
                                            <p className="text-sm font-medium text-gray-900">{nowServing.patientId?.patientId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</p>
                                            <p className={`text-sm font-bold capitalize ${nowServing.priority === 'high' ? 'text-red-600' : 'text-green-600'}`}>
                                                {nowServing.priority}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(nowServing._id, 'completed')}
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                        Mark Attended
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(nowServing._id, 'no_show')}
                                        disabled={submitting}
                                        className="bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium rounded-lg px-4 py-2 text-sm border border-gray-300 transition-colors"
                                    >
                                        No Show
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <p className="text-gray-500 text-sm mb-3">No patient currently being served</p>
                                {upcoming.length > 0 && (
                                    <button
                                        onClick={() => handleStatusUpdate(upcoming[0]._id, 'in_progress')}
                                        disabled={submitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2 text-sm transition-colors"
                                    >
                                        Call Next Patient ({upcoming[0].tokenNumber})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Patients */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Upcoming Patients</h2>
                            <p className="text-xs text-gray-500 mt-1">Next patients in queue</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-100">
                                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600 uppercase">Token</th>
                                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600 uppercase">Patient</th>
                                        <th className="text-left py-2 px-4 text-xs font-semibold text-gray-600 uppercase">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {upcoming.slice(0, 5).map((t, index) => (
                                        <tr key={t._id} className={index !== upcoming.slice(0, 5).length - 1 ? "border-b border-gray-100" : ""}>
                                            <td className="font-mono font-semibold text-blue-600 py-2 px-4 text-sm">{t.tokenNumber}</td>
                                            <td className="py-2 px-4 text-sm text-gray-900 font-medium">{t.patientId?.fullName}</td>
                                            <td className="py-2 px-4 text-sm text-gray-500">
                                                {new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                    {upcoming.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center text-gray-500 py-8 text-sm">No upcoming patients</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Queue Volume</h2>
                            <p className="text-xs text-gray-500 mt-1">Daily patient statistics</p>
                        </div>
                        <div className="h-64 mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.weeklyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} dy={5} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} dx={-5} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px' }}
                                        cursor={{ fill: '#F9FAFB' }}
                                    />
                                    <Bar dataKey="patients" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col shadow-sm ">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Service Performance</h2>
                            <p className="text-xs text-gray-500 mt-1">Monthly throughput overview</p>
                        </div>
                        <div className="h-64 mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={patientFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px' }}
                                    />
                                    <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                                    <Line type="monotone" dataKey="scheduled" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Scheduled" />
                                    <Line type="monotone" dataKey="attended" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Attended" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
