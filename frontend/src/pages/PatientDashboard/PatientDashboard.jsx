import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatWidget from '../../components/common/ChatWidgets';
import { Ticket, Clock, CalendarDays, Building2, Loader2, CheckCircle2, Sparkles, User } from 'lucide-react';
import patientDashboardService from '@/services/patientDashboardService';
import { toast } from 'sonner';
import AIRecommendations from '../../components/common/AIRecommendations';

export default function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myQueue, setMyQueue] = useState([]);
  const [quickSuggestions, setQuickSuggestions] = useState([]);

  // Selection states
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchInitialData();

    const interval = setInterval(() => {
      fetchQueueUpdate();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchQueueUpdate = async () => {
    try {
      const qResp = await patientDashboardService.getMyQueue();
      setMyQueue(qResp.data || []);
    } catch (error) {
      console.error('Queue update error:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hResp, qResp] = await Promise.all([
        patientDashboardService.getHospitals(),
        patientDashboardService.getMyQueue()
      ]);
      setHospitals(hResp.data || []);
      setMyQueue(qResp.data || []);
      fetchQuickSuggestions(selectedHospital);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickSuggestions = async (hospitalId = '') => {
    try {
      const resp = await patientDashboardService.getQuickSuggestion(hospitalId);
      setQuickSuggestions(resp.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Fetch departments when hospital changes
  useEffect(() => {
    if (selectedHospital) {
      fetchDepartments(selectedHospital);
      setDepartments([]);
      setSelectedDept('');
      setDoctors([]);
      setSelectedDoctor('');
      fetchQuickSuggestions(selectedHospital);
    } else if (!loading) {
      setDepartments([]);
      setSelectedDept('');
      setDoctors([]);
      setSelectedDoctor('');
      fetchQuickSuggestions('');
    }
  }, [selectedHospital]);

  const fetchDepartments = async (hId) => {
    try {
      const resp = await patientDashboardService.getHospitalDepartments(hId);
      setDepartments(resp.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch doctors when department changes
  useEffect(() => {
    if (selectedDept && selectedHospital) {
      const dept = departments.find(d => d._id === selectedDept);
      if (dept) {
        fetchDoctors(selectedHospital, dept.name);
      }
    } else {
      setDoctors([]);
      setSelectedDoctor('');
    }
  }, [selectedDept]);

  const fetchDoctors = async (hId, deptName) => {
    try {
      const resp = await patientDashboardService.getAvailableDoctors(hId, deptName);
      const fetchedDoctors = resp.data || [];
      setDoctors(fetchedDoctors);

      // Auto-select the doctor with the least queue count
      if (fetchedDoctors.length > 0) {
        const leastBusyDoctor = [...fetchedDoctors].sort((a, b) => (a.queueCount || 0) - (b.queueCount || 0))[0];
        setSelectedDoctor(leastBusyDoctor._id);
        toast.info(`Auto-selected ${leastBusyDoctor.fullName} (least busy)`);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleBookToken = async () => {
    if (!selectedHospital || !selectedDept || !selectedDoctor) return;

    try {
      setSubmitting(true);
      const dept = departments.find(d => d._id === selectedDept);
      const payload = {
        hospitalId: selectedHospital,
        department: dept.name,
        doctorId: selectedDoctor
      };

      await patientDashboardService.bookToken(payload);

      // Refresh queue and reset selection
      const qResp = await patientDashboardService.getMyQueue();
      setMyQueue(qResp.data || []);

      setSelectedHospital('');
      setSelectedDept('');
      setSelectedDoctor('');

      toast.success('Token booked successfully!');
    } catch (error) {
      console.error('Error booking token:', error);
      toast.error(error.response?.data?.message || 'Error booking token');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickBook = async (suggestion) => {
    try {
      setSubmitting(true);
      const payload = {
        hospitalId: suggestion.hospital_id,
        department: suggestion.department,
        doctorId: suggestion.doctor_id
      };

      await patientDashboardService.bookToken(payload);

      // Refresh queue and suggestion
      const [qResp, sResp] = await Promise.all([
        patientDashboardService.getMyQueue(),
        patientDashboardService.getQuickSuggestion()
      ]);
      setMyQueue(qResp.data || []);
      setQuickSuggestions(sResp.data || []);

      toast.success(`Successfully booked with ${suggestion.doctor_name || suggestion.option?.doctor_name}`);
    } catch (error) {
      console.error('Quick book error:', error);
      toast.error(error.response?.data?.message || 'Error booking quick token');
    } finally {
      setSubmitting(false);
    }
  };

  const activeToken = myQueue.find(t => t.status === 'waiting' || t.status === 'in_progress');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back, {user?.fullName || 'Patient'}</p>
        </div>

        {/* Book Appointment Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Book */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Next Appointment</h2>
            <p className="text-sm text-gray-600 mb-6">Find available slots and get AI-powered recommendations.</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Hospital</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                >
                  <option value="">Choose Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Department</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white disabled:bg-gray-50"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  disabled={!selectedHospital}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Doctor</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white disabled:bg-gray-50"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  disabled={!selectedDept}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.fullName} ({doc.queueCount || 0} in queue)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 text-base transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!selectedDoctor || submitting}
              onClick={handleBookToken}
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Ticket size={20} />}
              Book Token
            </button>
          </div>

          {/* Live Queue Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Live Queue</h2>
            {activeToken ? (
              <>
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 ${activeToken.status === 'in_progress' ? 'bg-green-50 animate-pulse' : 'bg-blue-50'}`}>
                  <Ticket size={48} className={activeToken.status === 'in_progress' ? 'text-green-600' : 'text-blue-600'} />
                </div>
                <p className="text-sm text-gray-600 mb-1">{activeToken.hospitalId?.name}</p>
                <p className="text-xs text-gray-400 mb-2">{activeToken.department}</p>
                <p className="text-sm text-gray-600 mb-1">Token ID</p>
                <p className="text-3xl font-bold text-blue-600 mb-6">{activeToken.tokenNumber}</p>
                <div className="flex gap-8">
                  <div>
                    <p className={`text-3xl font-bold ${activeToken.status === 'in_progress' ? 'text-green-600' : 'text-gray-900'}`}>
                      {activeToken.status === 'in_progress' ? 'NOW' : activeToken.position}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{activeToken.status === 'in_progress' ? 'Serving' : 'Position'}</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {activeToken.status === 'in_progress' ? '—' : `${activeToken.estimatedWaitTime} min`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Est. Wait</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10">
                <p className="text-gray-400 italic">No active tokens</p>
                <p className="text-xs text-gray-300 mt-2">Book an appointment to see your queue status</p>
              </div>
            )}
          </div>
        </div>

        {/* Proactive Recommendations Section */}
        {quickSuggestions && quickSuggestions.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedHospital ? 'Recommended Doctors at Selected Hospital' : 'Recommended Doctors Overall'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickSuggestions.map((suggestion, idx) => {
                const doc = suggestion.option || suggestion;
                const waitTime = Math.round(suggestion.predicted_wait_min);
                
                return (
                  <div key={idx} className="group relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full">
                    <div className="absolute top-4 right-4 text-indigo-100 group-hover:text-indigo-500 transition-colors">
                      <Sparkles size={24} />
                    </div>
                    
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                        <User size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{doc.doctor_name}</h3>
                      <p className="text-sm font-semibold text-indigo-600">{doc.department}</p>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available At</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {doc.available_at || `${waitTime}m`}
                        </span>
                      </div>

                      <button
                        disabled={submitting}
                        onClick={() => handleQuickBook(doc.doctor_id ? doc : suggestion)}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Ticket size={16} />}
                        Book Token
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Recommended Slots */}
        {/* {selectedDept && selectedHospital && (
          <div className="mb-12">
            <AIRecommendations
              department={departments.find(d => d._id === selectedDept)?.name}
              hospitalId={selectedHospital}
            />
          </div>
        )} */}

        {/* My Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
            <button
              onClick={fetchInitialData}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Token</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Hospital</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {myQueue.length > 0 ? (
                  myQueue.map((t, index) => (
                    <tr key={t._id} className={index !== myQueue.length - 1 ? "border-b border-gray-100" : ""}>
                      <td className="font-mono font-semibold text-blue-600 py-4 px-6 text-base">{t.tokenNumber}</td>
                      <td className="py-4 px-6 text-base text-gray-900">{t.hospitalId?.name}</td>
                      <td className="py-4 px-6 text-base text-gray-900">{t.department}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            t.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400 italic">No appointments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ChatWidget />
    </DashboardLayout>
  );
}
