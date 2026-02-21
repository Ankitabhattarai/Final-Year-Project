import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Ticket, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import adminService from '@/services/adminService';
import queueService from '@/services/queueService';
import patientService from '@/services/patientService';
import { toast } from 'sonner';

export default function TokenGen() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data states
    const [hospital, setHospital] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [queue, setQueue] = useState([]);
    const [queuePagination, setQueuePagination] = useState({
        current: 1,
        pages: 1,
        total: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [metrics, setMetrics] = useState({
        tokensIssued: 0,
        avgWaitTime: 0,
        completed: 0,
        noShows: 0
    });

    // Form states
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [searchPatient, setSearchPatient] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [hResp, dResp, mResp, pResp] = await Promise.all([
                adminService.getAllHospitals(),
                adminService.getAllDepartments(),
                adminService.getDashboardMetrics(),
                patientService.getAllPatients()
            ]);

            setHospital(hResp.data?.[0]);
            setDepartments(dResp.data || []);
            setPatients(pResp.data?.patients || []);

            // Initial queue fetch
            await fetchQueue(1);

            if (mResp.success) {
                setMetrics({
                    tokensIssued: mResp.data.totalPatientsToday.value,
                    avgWaitTime: mResp.data.avgWaitTime.value,
                    completed: mResp.data.completedToday?.value || 0,
                    noShows: mResp.data.noShowsToday?.value || 0
                });
            }
        } catch (error) {
            console.error('Error fetching kiosk data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQueue = async (page) => {
        try {
            const qResp = await queueService.getQueueList({ page, limit: 10 });
            if (qResp.success) {
                setQueue(qResp.data.queues || []);
                setQueuePagination(qResp.data.pagination);
                setCurrentPage(qResp.data.pagination.current);
            }
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= queuePagination.pages) {
            fetchQueue(newPage);
        }
    };

    // Fetch doctors when department changes
    useEffect(() => {
        if (selectedDept) {
            fetchDoctors(selectedDept);
        } else {
            setDoctors([]);
            setSelectedDoctor('');
        }
    }, [selectedDept]);

    const fetchDoctors = async (deptName) => {
        try {
            const resp = await adminService.getAllUsers({ role: 'doctor', department: deptName });
            setDoctors(resp.data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleIssueToken = async () => {
        if (!selectedDept || !selectedDoctor || !selectedPatientId) {
            toast.error('Please select department, doctor and patient');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                patientId: selectedPatientId,
                doctorId: selectedDoctor,
                department: selectedDept,
                scheduledTime: new Date().toISOString(),
                appointmentType: 'walk-in'
            };

            await queueService.createQueueEntry(payload);

            // Success: Reset form and refresh current page of queue
            setSelectedDept('');
            setSelectedDoctor('');
            setSelectedPatientId('');
            setSearchPatient('');

            await fetchQueue(1); // Reset to page 1 to see the new token

            const mResp = await adminService.getDashboardMetrics();
            if (mResp.success) {
                setMetrics({
                    tokensIssued: mResp.data.totalPatientsToday.value,
                    avgWaitTime: mResp.data.avgWaitTime.value,
                    completed: mResp.data.completedToday?.value || 0,
                    noShows: mResp.data.noShowsToday?.value || 0
                });
            }

            toast.success('Token issued successfully!');
        } catch (error) {
            console.error('Error issuing token:', error);
            toast.error(error.response?.data?.message || 'Error issuing token');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Token Kiosk & Queue Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Dynamic queue monitoring for {hospital?.name || 'Hospital'}.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Issue Token */}
                    <div className="p-6 rounded-lg border border-border bg-white shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">
                            Issue New Token
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select department, doctor, and patient to generate a token.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 gray-700">Department</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d) => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 gray-700">Doctor</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-gray-50"
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    disabled={!selectedDept}
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>{doc.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 gray-700">Patient</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={selectedPatientId}
                                    onChange={(e) => setSelectedPatientId(e.target.value)}
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map((p) => (
                                        <option key={p._id} value={p._id}>{p.fullName} ({p.patientId})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="w-full mt-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                onClick={handleIssueToken}
                                disabled={!selectedDept || !selectedDoctor || !selectedPatientId || submitting}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Ticket size={18} />}
                                Issue Token
                            </button>
                        </div>
                    </div>

                    {/* Live Queue */}
                    <div className="p-6 rounded-lg border border-border bg-white shadow-sm lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Live Queue Overview</h2>
                            <button
                                onClick={() => fetchInitialData()}
                                className="text-xs font-medium text-blue-600 hover:underline"
                            >
                                Refresh Live
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500">
                                        <th className="p-3 text-left font-semibold">Token</th>
                                        <th className="p-3 text-left font-semibold">Patient</th>
                                        <th className="p-3 text-left font-semibold">Dept.</th>
                                        <th className="p-3 text-left font-semibold">Doctor</th>
                                        <th className="p-3 text-left font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400 italic">No patients in queue currently</td>
                                        </tr>
                                    ) : (
                                        queue.map((t) => (
                                            <tr key={t._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                <td className="p-3 font-mono font-bold text-blue-600">
                                                    {t.tokenNumber}
                                                </td>
                                                <td className="p-3 font-medium">{t.patientId?.fullName || 'N/A'}</td>
                                                <td className="p-3 text-gray-600">{t.department}</td>
                                                <td className="p-3 text-gray-600">{t.doctorId?.fullName || 'N/A'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${t.status === 'waiting' ? 'bg-gray-100 text-gray-600' :
                                                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                            t.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-600'
                                                        }`}>
                                                        {t.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {queuePagination.pages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, queuePagination.total)}</span> of <span className="font-medium">{queuePagination.total}</span> tokens
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(queuePagination.pages)].map((_, idx) => (
                                            <button
                                                key={idx + 1}
                                                onClick={() => handlePageChange(idx + 1)}
                                                className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${currentPage === idx + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === queuePagination.pages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Reference */}
                    <div className="p-6 rounded-lg border border-border bg-white shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">
                            Operational Guidelines
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { title: 'Token Printing', desc: 'Ensure kiosk printer is online before issuing.' },
                                { title: 'Emergency Protocol', desc: 'Flag critical patients for immediate doctor attention.' },
                                { title: 'Queue Reset', desc: 'Tokens are automatically reset daily at 00:00.' },
                                { title: 'Support', desc: 'Contact technical team for system sync issues.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">{idx + 1}</div>
                                    <div>
                                        <p className="font-semibold text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-500 uppercase font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Summary */}
                    <div className="p-6 rounded-lg border border-border bg-white shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">
                            Today's Metrics
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Real-time overview of your hospital's token operations.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 relative overflow-hidden group">
                                <Ticket size={40} className="absolute -right-2 -bottom-2 text-blue-200/50 group-hover:scale-110 transition-transform" />
                                <p className="text-3xl font-bold text-blue-600">{metrics.tokensIssued}</p>
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Tokens Issued</p>
                            </div>

                            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 relative overflow-hidden group">
                                <Clock size={40} className="absolute -right-2 -bottom-2 text-purple-200/50 group-hover:scale-110 transition-transform" />
                                <p className="text-3xl font-bold text-purple-600">{metrics.avgWaitTime}</p>
                                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-1">Avg Wait (Min)</p>
                            </div>

                            <div className="p-4 rounded-xl bg-green-50 border border-green-100 relative overflow-hidden group">
                                <CheckCircle size={40} className="absolute -right-2 -bottom-2 text-green-200/50 group-hover:scale-110 transition-transform" />
                                <p className="text-3xl font-bold text-green-600">{metrics.completed}</p>
                                <p className="text-xs font-bold text-green-400 uppercase tracking-widest mt-1">Completed</p>
                            </div>

                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 relative overflow-hidden group">
                                <XCircle size={40} className="absolute -right-2 -bottom-2 text-red-200/50 group-hover:scale-110 transition-transform" />
                                <p className="text-3xl font-bold text-red-600">{metrics.noShows}</p>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mt-1">No-Shows</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
