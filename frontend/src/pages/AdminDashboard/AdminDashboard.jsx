import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QueueTable from '@/components/common/QueueTable';
import adminService from '@/services/adminService';
import { Users, Clock, Layers, UserCheck, RefreshCw, BarChart2, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [flowData, setFlowData] = useState([]);
  const [waitTimeData, setWaitTimeData] = useState([]);
  const [queueData, setQueueData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      if (!metrics) setLoading(true);
      else setRefreshing(true);

      const [mResp, fResp, wResp, qResp] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getPatientFlow('7days'),
        adminService.getDepartmentWaitTimes(),
        adminService.getQueueStatus()
      ]);

      if (mResp.success) setMetrics(mResp.data);
      if (fResp.success) {
        // Format flow data for Recharts
        const formattedFlow = fResp.data.patientFlow.map(item => ({
          month: `${item._id.month}/${item._id.day}`,
          scheduled: item.scheduled,
          attended: item.attended
        }));
        setFlowData(formattedFlow);
      }
      if (wResp.success) {
        setWaitTimeData(wResp.data.map(d => ({
          department: d._id,
          waitTime: Math.round(d.avgWaitTime)
        })));
      }
      if (qResp.success) {
        // Map backend fields to QueueTable expectations
        setQueueData(qResp.data.map((q, idx) => ({
          ...q,
          id: q._id || idx,
          departmentName: q.department,
          estimatedWait: q.estimatedWaitTime || 0
        })));
      }

      // Also get recent history from detailed reports
      const historyResp = await adminService.getAllUsers({ limit: 5 }); // Fallback or separate history endpoint
      // For now, let's use the summary stats as a proxy if no history endpoint exists
      // or we can fetch detailed report

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Monitoring</h1>
            <p className="text-slate-500 mt-1 font-medium">Real-time hospital operations overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <Link
              to="/admin/reports"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 py-2.5 text-sm transition-all shadow-lg shadow-blue-200"
            >
              <BarChart2 size={18} />
              Detailed Reports
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardStatCard
            label="Total Patients Today"
            value={metrics?.totalPatientsToday.value}
            change={metrics?.totalPatientsToday.change}
            icon={<Users />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <DashboardStatCard
            label="Avg. Wait Time"
            value={`${metrics?.avgWaitTime.value} min`}
            changeText={metrics?.avgWaitTime.changeText}
            icon={<Clock />}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <DashboardStatCard
            label="Active Queues"
            value={metrics?.activeQueues.value}
            changeText={metrics?.activeQueues.changeText}
            icon={<Layers />}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <DashboardStatCard
            label="Doctor Availability"
            value={`${metrics?.doctorAvailability.value}%`}
            changeText={metrics?.doctorAvailability.changeText}
            icon={<UserCheck />}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Patient Flow Trending</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flowData}>
                  <defs>
                    <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="scheduled" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorScheduled)" />
                  <Area type="monotone" dataKey="attended" stroke="#10B981" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Avg Wait by Department</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} unit="m" />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="waitTime" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Real-time Queue Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-12">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Current Queue Status</h3>
              <p className="text-sm text-slate-500">Live monitoring of patients undergoing service</p>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
          <QueueTable tokens={queueData} showDoctor />
        </div>
      </div>
    </DashboardLayout>
  );
}

function DashboardStatCard({ label, value, change, changeText, icon, color, bgColor }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mb-px">{value !== undefined ? value : '...'}</h3>
          {change !== undefined ? (
            <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp size={12} className={!isPositive ? 'rotate-180' : ''} />
              {isPositive ? '+' : ''}{change}%
              <span className="text-slate-400 font-normal">from yesterday</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-2 font-medium">{changeText}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>
    </div>
  );
}

function TrendingUp({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );
}

