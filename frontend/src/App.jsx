import { useState, useEffect } from "react";
import Landing from "./Landing";
import Login from "./login";
import Signup from "./signup";
import PatientDashboard from "./PatientDashboard";
import AdminDashboard from "./AdminDashboard";
import HospitalAdminLogin from "./HospitalAdminLogin";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  useEffect(() => {
    // Check URL for specific routes first
    const path = window.location.pathname;
    
    if (path === '/admin-dashboard') {
      // Only allow access if user is logged in as hospital admin
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        const userData = JSON.parse(user);
        if (userData.role === 'hospital_admin') {
          setCurrentPage("admin");
        } else {
          // Wrong role, redirect to landing
          setCurrentPage("landing");
          window.history.pushState({}, '', '/');
        }
      } else {
        // Not logged in, redirect to landing
        setCurrentPage("landing");
        window.history.pushState({}, '', '/');
      }
      return;
    }
    
    if (path === '/hospital-admin-login') {
      setCurrentPage("hospitalAdminLogin");
      return;
    }

    // For root path ('/'), always show landing page first
    // Don't auto-redirect based on login status
    if (path === '/' || path === '') {
      setCurrentPage("landing");
      return;
    }

    // For any other path, show landing page
    setCurrentPage("landing");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage("landing");
  };

  // Handle URL changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin-dashboard') {
        setCurrentPage("admin");
      } else if (path === '/hospital-admin-login') {
        setCurrentPage("hospitalAdminLogin");
      } else {
        // Default behavior for other routes
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          const userData = JSON.parse(user);
          if (userData.role === 'hospital_admin') {
            setCurrentPage("admin");
          } else {
            setCurrentPage("dashboard");
          }
        } else {
          setCurrentPage("landing");
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div>
      {currentPage === "landing" && (
        <Landing
          onNavigateToLogin={() => setCurrentPage("login")}
          onNavigateToSignup={() => setCurrentPage("signup")}
        />
      )}
      {currentPage === "login" && (
        <Login 
          onNavigateToSignup={() => setCurrentPage("signup")}
          onNavigateToLanding={() => setCurrentPage("landing")}
          onLoginSuccess={() => setCurrentPage("dashboard")}
        />
      )}
      {currentPage === "signup" && (
        <Signup 
          onNavigateToLogin={() => setCurrentPage("login")}
          onNavigateToLanding={() => setCurrentPage("landing")}
          onSignupSuccess={() => setCurrentPage("dashboard")}
        />
      )}
      {currentPage === "dashboard" && (
        <PatientDashboard 
          onLogout={handleLogout}
        />
      )}
      {currentPage === "admin" && (
        <AdminDashboard />
      )}
      {currentPage === "hospitalAdminLogin" && (
        <HospitalAdminLogin 
          onNavigateToLanding={() => setCurrentPage("landing")}
          onLoginSuccess={() => setCurrentPage("admin")}
        />
      )}
    </div>
  );
}

export default App;
