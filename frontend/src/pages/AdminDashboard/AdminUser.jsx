import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import adminService from '@/services/adminService';
import { toast } from 'sonner';
import { Building2, Layers, Stethoscope, Users, Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';

/* ─── Tabs config ─── */
const tabs = [
  { key: 'hospital', label: 'My Hospital', icon: <Building2 size={18} /> },
  { key: 'departments', label: 'Departments', icon: <Layers size={18} /> },
  { key: 'doctors', label: 'Doctors', icon: <Stethoscope size={18} /> },
  { key: 'users', label: 'Staff & Users', icon: <Users size={18} /> },
];

/* ─── Generic modal wrapper ─── */
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Delete confirmation modal ─── */
function ConfirmModal({ open, onClose, onConfirm, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-sm mx-4 p-6 text-center">
        <Trash2 size={32} className="mx-auto text-red-500 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete {name}?</h3>
        <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('hospital');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0); // Trigger to reload data

  // Data states
  const [hospitalList, setHospitalList] = useState([]);
  const [deptList, setDeptList] = useState([]); // Flattened departments
  const [doctorList, setDoctorList] = useState([]);
  const [userList, setUserList] = useState([]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hospitalsRes, departmentsRes, usersRes] = await Promise.all([
          adminService.getAllHospitals(),
          adminService.getAllDepartments(),
          adminService.getAllUsers()
        ]);

        if (hospitalsRes.success) setHospitalList(hospitalsRes.data);
        if (departmentsRes.success) setDeptList(departmentsRes.data);
        if (usersRes.success) {
          const allUsers = usersRes.data;
          setUserList(allUsers);
          setDoctorList(allUsers.filter(u => u.role === 'doctor'));
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const reloadData = () => setRefresh(prev => prev + 1);

  /* ─── Hospitals state ─── */
  const [hospitalModal, setHospitalModal] = useState({ open: false, editing: null });
  const [hospitalForm, setHospitalForm] = useState({ name: '', address: '', contact: '', registrationNumber: '' });

  const openAddHospital = () => { setHospitalForm({ name: '', address: { street: '', city: '', state: '', zipCode: '' }, contact: { phone: '', email: '' }, registrationNumber: '' }); setHospitalModal({ open: true, editing: null }); };
  const openEditHospital = (h) => { setHospitalForm({ name: h.name, address: h.address || { street: '', city: '', state: '', zipCode: '' }, contact: h.contact || { phone: '', email: '' }, registrationNumber: h.registrationNumber || '' }); setHospitalModal({ open: true, editing: h }); };

  const saveHospital = async () => {
    try {
      if (hospitalModal.editing) {
        await adminService.updateHospital(hospitalModal.editing._id, hospitalForm);
      }
      setHospitalModal({ open: false, editing: null });
      reloadData();
      toast.success('Hospital profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving hospital');
    }
  };

  const deleteHospital = async (id) => {
    try {
      await adminService.deleteHospital(id);
      reloadData();
      toast.success('Hospital deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting hospital');
    }
  };

  /* ─── Departments state ─── */
  const [deptModal, setDeptModal] = useState({ open: false, editing: null });
  const [deptForm, setDeptForm] = useState({ name: '', code: '', hospitalId: '', description: '' });

  const openAddDept = () => { setDeptForm({ name: '', code: '', hospitalId: hospitalList[0]?._id || '', description: '' }); setDeptModal({ open: true, editing: null }); };
  const openEditDept = (d) => { setDeptForm({ name: d.name, code: d.code || '', hospitalId: d.hospitalId, description: d.description || '' }); setDeptModal({ open: true, editing: d }); };

  const saveDept = async () => {
    try {
      if (deptModal.editing) {
        await adminService.updateDepartment(deptModal.editing.hospitalId, deptModal.editing._id, deptForm);
      } else {
        // hospitalId is handled by backend from auth context
        await adminService.addDepartment(deptForm);
      }
      setDeptModal({ open: false, editing: null });
      reloadData();
      toast.success(deptModal.editing ? 'Department updated' : 'Department added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving department');
    }
  };

  const deleteDept = async (hospitalId, deptId) => {
    try {
      await adminService.deleteDepartment(hospitalId, deptId);
      reloadData();
      toast.success('Department deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting department');
    }
  };

  /* ─── Doctors/Users Forms state ─── */
  // Unified logic for Doctors and Users since Doctors are Users with role='doctor'
  const [userModal, setUserModal] = useState({ open: false, editing: null, type: 'user' }); // type: 'user' | 'doctor'
  const [userForm, setUserForm] = useState({
    fullName: '', email: '', password: '', phone: '', role: 'patient',
    hospitalId: '', department: '', specialty: '', available: true
  });

  const openAddUser = (type) => {
    setUserForm({
      fullName: '', email: '', password: '', phone: '',
      role: type === 'doctor' ? 'doctor' : 'patient',
      hospitalId: hospitalList[0]?._id || '', department: '', specialty: '', available: true
    });
    setUserModal({ open: true, editing: null, type });
  };

  const openEditUser = (u, type) => {
    setUserForm({
      fullName: u.fullName, email: u.email, password: '', phone: u.profile?.phone || '',
      role: u.role,
      hospitalId: u.hospitalId?._id || u.hospitalId || '',
      department: u.employeeDetails?.department || '',
      specialty: u.employeeDetails?.specialization || '',
      available: u.employeeDetails?.isActive ?? true
    });
    setUserModal({ open: true, editing: u, type });
  };

  const saveUser = async () => {
    try {
      const payload = {
        fullName: userForm.fullName,
        email: userForm.email,
        role: userForm.role,
        profile: { phone: userForm.phone }
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (userForm.role === 'doctor' || userForm.role === 'staff') {
        payload.employeeDetails = {
          department: userForm.department,
          specialization: userForm.specialty,
          isActive: userForm.available
        };
      }

      if (userModal.editing) {
        await adminService.updateUser(userModal.editing._id, payload);
      } else {
        await adminService.createUser(payload);
      }
      setUserModal({ open: false, editing: null, type: 'user' });
      reloadData();
      toast.success(userModal.editing ? 'User updated' : 'User created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    }
  };

  const deleteUser = async (id) => {
    try {
      await adminService.deleteUser(id);
      reloadData();
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };


  /* ─── Delete ─── */
  const [confirmDelete, setConfirmDelete] = useState({ open: false, name: '', onConfirm: () => { } });
  const askDelete = (name, onConfirm) => setConfirmDelete({ open: true, name, onConfirm });

  /* ─── Search filter helper ─── */
  const q = search.toLowerCase();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Administration</h1>
          <p className="text-gray-600 mt-1">Manage your hospital's departments, doctors, and staff members.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Search ${activeTab}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 ${activeTab === 'hospital' ? 'hidden' : ''}`}
            onClick={
              activeTab === 'departments' ? openAddDept :
                activeTab === 'doctors' ? () => openAddUser('doctor') :
                  () => openAddUser('user')
            }
          >
            <Plus size={16} /> Add {activeTab === 'users' ? 'Staff/User' : activeTab.slice(0, -1).replace(/^./, (c) => c.toUpperCase())}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <>
            {/* ── My Hospital Profile ── */}
            {activeTab === 'hospital' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {hospitalList.map((h) => (
                    <div key={h._id} className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{h.name}</h2>
                          <p className="text-gray-500">Registration: {h.registrationNumber}</p>
                        </div>
                        <button onClick={() => openEditHospital(h)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <Pencil size={16} /> Edit Profile
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Address</h3>
                            <p className="text-gray-600">
                              {h.address?.street}, {h.address?.city}
                              <br />
                              {h.address?.state}, {h.address?.zipCode}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact</h3>
                            <p className="text-gray-600">
                              Phone: {h.contact?.phone}
                              <br />
                              Email: {h.contact?.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-blue-600">{deptList.length}</h3>
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Departments</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-xl text-center">
                            <h3 className="text-2xl font-bold text-green-600">{doctorList.length}</h3>
                            <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Doctors</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Departments Table ── */}
            {activeTab === 'departments' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {deptList.filter((d) => d.name.toLowerCase().includes(q)).map((d) => (
                        <tr key={d._id} className="border-b border-gray-200 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                              {d.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">Active</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openEditDept(d)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1 text-gray-700">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => askDelete(d.name, () => deleteDept(d.hospitalId, d._id))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Doctors Table ── */}
            {activeTab === 'doctors' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Specialty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {doctorList.filter((d) => d.fullName.toLowerCase().includes(q) || (d.employeeDetails?.specialization || '').toLowerCase().includes(q)).map((d) => (
                        <tr key={d._id} className="border-b border-gray-200 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-900">{d.fullName}</td>
                          <td className="px-4 py-3 text-gray-600">{d.employeeDetails?.specialization}</td>
                          <td className="px-4 py-3 text-gray-600">{d.employeeDetails?.department || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${d.employeeDetails?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {d.employeeDetails?.isActive ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openEditUser(d, 'doctor')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1 text-gray-700">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => askDelete(d.fullName, () => deleteUser(d._id))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Users Table ── */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {userList.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).map((u) => (
                        <tr key={u._id} className="border-b border-gray-200 last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                          <td className="px-4 py-3 text-gray-600">{u.email}</td>
                          <td className="px-4 py-3 text-gray-600">{u.profile?.phone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                              u.role === 'doctor' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openEditUser(u, u.role === 'doctor' ? 'doctor' : 'user')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1 text-gray-700">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => askDelete(u.fullName, () => deleteUser(u._id))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Modals ─── */}

      {/* Hospital modal (Edit Only) */}
      <Modal open={hospitalModal.open} onClose={() => setHospitalModal({ open: false, editing: null })} title="Edit Hospital Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Hospital Name</label>
            <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.name} onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Registration Number</label>
            <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.registrationNumber} onChange={(e) => setHospitalForm({ ...hospitalForm, registrationNumber: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Street</label>
              <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.address?.street} onChange={(e) => setHospitalForm({ ...hospitalForm, address: { ...hospitalForm.address, street: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
              <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.address?.city} onChange={(e) => setHospitalForm({ ...hospitalForm, address: { ...hospitalForm.address, city: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">State</label>
              <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.address?.state} onChange={(e) => setHospitalForm({ ...hospitalForm, address: { ...hospitalForm.address, state: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Zip Code</label>
              <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.address?.zipCode} onChange={(e) => setHospitalForm({ ...hospitalForm, address: { ...hospitalForm.address, zipCode: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
              <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.contact?.phone} onChange={(e) => setHospitalForm({ ...hospitalForm, contact: { ...hospitalForm.contact, phone: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={hospitalForm.contact?.email} onChange={(e) => setHospitalForm({ ...hospitalForm, contact: { ...hospitalForm.contact, email: e.target.value } })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setHospitalModal({ open: false, editing: null })} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={saveHospital} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      {/* Department modal */}
      <Modal open={deptModal.open} onClose={() => setDeptModal({ open: false, editing: null })} title={deptModal.editing ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Department Name</label>
            <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Code</label>
            <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={3} value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })} />
          </div>
          {/* Hospital is implicit for Hospital Admin */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDeptModal({ open: false, editing: null })} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={saveDept} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      {/* User / Doctor Modal (Unified) */}
      <Modal open={userModal.open} onClose={() => setUserModal({ open: false, editing: null, type: 'user' })} title={userModal.editing ? `Edit ${userModal.type === 'doctor' ? 'Doctor' : 'User'}` : `Add ${userModal.type === 'doctor' ? 'Doctor' : 'User'}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
            <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
            <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          </div>
          {!userModal.editing && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
            <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
          </div>

          {/* Role Selection (Only if not specifically adding a doctor via doctor tab, or allow changing) */}
          {userModal.type !== 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff Member</option>
                <option value="patient">Patient (User)</option>
              </select>
            </div>
          )}

          {/* Doctor specific fields */}
          {/* Hospital is implicit */}

          {(userForm.role === 'doctor' || userForm.role === 'staff') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Department</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}>
                  <option value="">Select Department</option>
                  {deptList.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">{userForm.role === 'doctor' ? 'Specialty' : 'Position'}</label>
                <input className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" value={userForm.specialty} onChange={(e) => setUserForm({ ...userForm, specialty: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="user-avail" checked={userForm.available} onChange={(e) => setUserForm({ ...userForm, available: e.target.checked })} className="rounded border-gray-300" />
                <label htmlFor="user-avail" className="text-sm text-gray-900">Active / Available</label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setUserModal({ open: false, editing: null, type: 'user' })} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={saveUser} className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, name: '', onConfirm: () => { } })}
        onConfirm={() => { confirmDelete.onConfirm(); setConfirmDelete({ open: false, name: '', onConfirm: () => { } }); }}
        name={confirmDelete.name}
      />
    </DashboardLayout>
  );
}