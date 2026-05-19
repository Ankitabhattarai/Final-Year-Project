import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    BarChart3, Clock, Users, Calendar, Download, Filter,
    ChevronRight, TrendingUp, AlertCircle, Loader2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import API_BASE_URL from '../../services/apiConfig';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ReportsDashboard() {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [dateRange, setDateRange] = useState('30'); // 7, 30, 90 days

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));
            const startStr = startDate.toISOString().split('T')[0];

            const [analyticsRes, summaryRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/reports/analytics?startDate=${startStr}&endDate=${endDate}`, { headers: getAuthHeader() }),
                axios.get(`${API_BASE_URL}/reports/summary?startDate=${startStr}&endDate=${endDate}`, { headers: getAuthHeader() })
            ]);

            if (analyticsRes.data.success) setAnalyticsData(analyticsRes.data.data);
            if (summaryRes.data.success) setSummaryData(summaryRes.data.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/export/csv`, {
                headers: getAuthHeader(),
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (loading && !analyticsData) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            </DashboardLayout>
        );
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedWeekly = analyticsData?.weeklyVisits.map(w => ({
        name: dayNames[w.day - 1],
        visits: w.count
    })) || [];

    const formattedHours = analyticsData?.busiestHours.map(h => ({
        hour: `${h.hour}:00`,
        count: h.count
    })) || [];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Hospital Analytics</h1>
                        <p className="text-slate-500 text-sm mt-1">Monitor performance, patient flow, and service metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-200"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Appointments"
                        value={summaryData?.summary.totalAppointments || 0}
                        icon={<Calendar className="text-blue-600" />}
                        trend="+12%"
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Avg Wait Time"
                        value={`${Math.round(summaryData?.summary.avgWaitTime || 0)} min`}
                        icon={<Clock className="text-amber-600" />}
                        trend="-2 min"
                        color="bg-amber-50"
                    />
                    <StatCard
                        title="Completed Visits"
                        value={summaryData?.summary.completed || 0}
                        icon={<CheckCircle iconColor="text-emerald-600" />}
                        trend="88% rate"
                        color="bg-emerald-50"
                    />
                    <StatCard
                        title="Total Patients"
                        value={analyticsData?.weeklyVisits.reduce((acc, curr) => acc + curr.count, 0) || 0}
                        icon={<Users className="text-purple-600" />}
                        trend="+5 new"
                        color="bg-purple-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Trends */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="text-blue-500" size={20} />
                                Weekly Patient Traffic
                            </h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={formattedWeekly}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Busiest Hours */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="text-amber-500" size={20} />
                                Busiest Hours
                            </h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formattedHours}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Wait Time Trends */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-8">Average Wait Time Trend (min)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData?.waitTimeTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="step" dataKey="avgWaitTime" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-8">Appointment Status</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData?.statusDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {analyticsData?.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ title, value, icon, trend, color }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                <h4 className="text-3xl font-bold text-slate-900 mt-2">{value}</h4>
                <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                    {trend}
                    <span className="text-slate-400 font-normal ml-1">this period</span>
                </p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
        </div>
    );
}

function CheckCircle({ iconColor }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColor}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    );
}
