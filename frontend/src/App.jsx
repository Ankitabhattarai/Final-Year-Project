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
import { Toaster } from 'sonner';

// Protected Route wrapper for authentication and role-based access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
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
              else if (target === 'adminDashboard') window.location.href = '/admin-dashboard';
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

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
