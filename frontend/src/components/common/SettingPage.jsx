import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import profileService from '@/services/profileService';
import { toast } from 'sonner';
import { Loader2, User, Lock, Bell, Mail, Shield, Smartphone, Globe, Camera } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  // Preferences state (Dummy for UI completeness)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    browserAlerts: false,
    publicProfile: true,
    twoFactor: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const resp = await profileService.getProfile();
      if (resp.success) {
        const data = resp.data;
        setName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.profile?.phone || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const resp = await profileService.updateProfile({
        fullName: name,
        email,
        phone
      });

      if (resp.success) {
        toast.success('Profile updated successfully');
        refreshUser({
          fullName: name,
          email,
          profile: { ...user.profile, phone }
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      const resp = await profileService.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      if (resp.success) {
        toast.success('Password changed successfully');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast.info(`Preference updated: ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  };

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
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile, security settings, and communication preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
              <div className="px-6 pb-6">
                <div className="relative -mt-12 flex justify-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-blue-600 text-4xl font-black overflow-hidden bg-slate-100">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                   
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                  <p className="text-sm text-slate-500">{email}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mt-3 uppercase tracking-wider">
                    <Shield size={12} />
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50 text-slate-600">
                    <span>Member since</span>
                    <span className="font-semibold text-slate-900">March 2024</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-50 text-slate-600">
                    <span>Profile Status</span>
                    <span className="text-emerald-600 font-bold">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hidden lg:block">
              <nav className="space-y-1">
                <a href="#profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold transition-all">
                  <User size={18} />
                  Profile Details
                </a>
                <a href="#security" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-all">
                  <Lock size={18} />
                  Security & Access
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Profile Section */}
            <section id="profile" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <User size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-medium cursor-not-allowed pr-12"
                      value={email}
                      readOnly
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={16} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 ml-1">Email address is managed by administrator and cannot be updated here.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 py-3 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving && <Loader2 className="animate-spin" size={18} />}
                    Update Profile
                  </button>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${isSecurityOpen ? 'ring-2 ring-indigo-500/20' : ''}`}>
              <div 
                className="px-8 py-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
                onClick={() => setIsSecurityOpen(!isSecurityOpen)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Security & Password</h3>
                </div>
                <div className={`text-slate-400 transition-transform duration-300 ${isSecurityOpen ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              
              {isSecurityOpen && (
                <form onSubmit={handlePasswordChange} className="p-8 space-y-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Min. 8 characters"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Repeat new password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-8 py-3 transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                      disabled={changingPassword}
                    >
                      {changingPassword && <Loader2 className="animate-spin" size={18} />}
                      Change Password
                    </button>
                  </div>
                </form>
              )}
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


