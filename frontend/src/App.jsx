import { Routes, Route, Navigate } from "react-router-dom";
import { ApiProvider } from "./context/ApiContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import PatientDashboard from "./pages/PatientDashboard/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import HospitalAdminLogin from "./pages/HospitalAdminLogin/HospitalAdminLogin";
import DoctorDashboard from "./pages/DoctorDashboard/DoctorDashboard";
import SettingsPage from "./components/common/SettingPage";
import TokenGen from "./pages/AdminDashboard/TokenGen";
import AdminUsersPage from "./pages/AdminDashboard/AdminUser";
import ReportsDashboard from "./pages/AdminDashboard/ReportsDashboard";
import SuperAdminDashboard from "./pages/AdminDashboard/SuperAdminDashboard";
import AdminHospitals from "./pages/AdminDashboard/AdminHospitals";
import AdminPatients from "./pages/AdminDashboard/AdminPatients";
import HospitalApply from "./pages/Landing/HospitalApply";
import ChangePassword from "./pages/auth/ChangePassword";
import { Toaster } from 'sonner';

// Protected Route wrapper for authentication and role-based access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Force password change if required
  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Map 'admin' to 'hospital_admin' for consistency with back/front requirements if needed
  // But AuthContext already provides 'role' which maps hospital_admin -> admin
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { logout } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing onNavigateToLogin={() => window.location.href = '/login'} onNavigateToSignup={() => window.location.href = '/signup'} />} />

        <Route path="/login" element={
          <Login
            onNavigateToSignup={() => window.location.href = '/signup'}
            onNavigateToLanding={() => window.location.href = '/'}
            onLoginSuccess={(target) => {
              if (target === 'doctorDashboard') window.location.href = '/doctor-dashboard';
              else if (target === 'adminDashboard') window.location.href = '/super-admin-dashboard';
              else window.location.href = '/dashboard';
            }}
          />
        } />

        <Route path="/signup" element={
          <Signup
            onNavigateToLogin={() => window.location.href = '/login'}
            onNavigateToLanding={() => window.location.href = '/'}
            onSignupSuccess={() => window.location.href = '/dashboard'}
          />
        } />

        <Route path="/hospital-admin-login" element={
          <HospitalAdminLogin
            onNavigateToLanding={() => window.location.href = '/'}
            onLoginSuccess={() => window.location.href = '/admin-dashboard'}
          />
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['patient', 'user']}>
            <PatientDashboard onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_admin']}>
            <ReportsDashboard />
          </ProtectedRoute>
        } />

        <Route path="/token-generate" element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_admin']}>
            <TokenGen />
          </ProtectedRoute>
        } />

        <Route path="/admin-users" element={
          <ProtectedRoute allowedRoles={['admin', 'hospital_admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />

        <Route path="/doctor-dashboard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard onLogout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['patient', 'user', 'admin', 'hospital_admin', 'doctor']}>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/super-admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/system/hospitals" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminHospitals />
          </ProtectedRoute>
        } />
        <Route path="/admin/system/patients" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPatients />
          </ProtectedRoute>
        } />

        {/* Public Hospital Onboarding */}
        <Route path="/join" element={<HospitalApply />} />

        {/* Auth Utility Routes */}
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
