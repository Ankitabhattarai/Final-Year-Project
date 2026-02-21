import DashboardLayout from '@/components/layout/DashboardLayout';
import QueueTable from '@/components/common/QueueTable';
import { adminStats, patientFlowData, waitTimeByDept, queueTokens, consultationHistory } from '@/data/mockData';
import { Users, Clock, Layers, UserCheck } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Monitoring Dashboard</h1>
            <p className="text-lg text-gray-600">Overview of all hospital operations</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg px-5 py-2.5 text-sm border border-gray-300 transition-colors">
              Export CSV
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors shadow-sm">
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stat Card 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Patients Today</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{adminStats.totalPatientsToday.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">
                  <span className={adminStats.totalPatientsChange > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {adminStats.totalPatientsChange > 0 ? '+' : ''}{adminStats.totalPatientsChange}%
                  </span> from yesterday
                </p>
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Avg. Wait Time</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{adminStats.avgWaitTime} min</h3>
                <p className="text-sm text-gray-600">
                  <span className={adminStats.avgWaitChange < 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {adminStats.avgWaitChange > 0 ? '+' : ''}{adminStats.avgWaitChange}%
                  </span> from last week
                </p>
              </div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Layers size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Queues</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{adminStats.activeQueues}</h3>
                <p className="text-sm text-gray-600">{adminStats.activeQueuesChange}</p>
              </div>
            </div>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <UserCheck size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Doctor Availability</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{adminStats.doctorAvailability}%</h3>
                <p className="text-sm text-gray-600">
                  <span className={adminStats.availabilityChange > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {adminStats.availabilityChange > 0 ? '+' : ''}{adminStats.availabilityChange}%
                  </span> from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Flow Over Time</h2>
            <p className="text-sm text-gray-600 mb-6">Scheduled vs. Attended patients monthly.</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="scheduled" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="Scheduled" />
                  <Line type="monotone" dataKey="attended" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Attended" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Average Wait Time by Department</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitTimeByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="department" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={12} unit=" min" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="waitTime" fill="#2563EB" radius={[8, 8, 0, 0]} name="Wait Time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Real-time Queue */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Real-time Queue Status</h2>
          <p className="text-sm text-gray-600 mb-6">Current patients awaiting service.</p>
          <QueueTable tokens={queueTokens} showDoctor />
        </div>

        {/* Reports */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Reports</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Patient Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Doctor</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {consultationHistory.map((c, index) => (
                  <tr key={c.id} className={index !== consultationHistory.length - 1 ? "border-b border-gray-100" : ""}>
                    <td className="font-mono py-4 px-6 text-sm text-gray-900">{c.id.toUpperCase().replace('CH', 'R-00')}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{c.patientName}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{c.departmentName}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{c.doctorName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'completed' ? 'bg-green-100 text-green-800' :
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6">
            <p className="text-sm text-gray-600">Page 1 of 5</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}