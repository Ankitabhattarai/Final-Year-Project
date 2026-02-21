import React, { useState } from "react";
import { useApi } from "../../context/ApiContext";
import { toast } from 'sonner';
import "./Login.css";

export default function Login({ onNavigateToSignup, onNavigateToLanding, onLoginSuccess }) {
  const { apiFetch } = useApi();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (data.success) {
        // Store token and user in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setSuccessMessage(`Welcome back, ${data.user.fullName}! Redirecting...`);

        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'doctor') {
            onLoginSuccess('doctorDashboard');
          } else if (data.user.role === 'admin' || data.user.role === 'hospital_admin') {
            onLoginSuccess('adminDashboard');
          } else {
            onLoginSuccess('dashboard');
          }
        }, 1000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Network error. Please check if the server is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="back-button" onClick={onNavigateToLanding}>
        ← Back to Home
      </button>
      <div className="auth-card">
        <div className="logo-container">
          <div className="logo-box">H</div>
          <span className="logo-title">Careline</span>
        </div>

        <h2 className="auth-title">Welcome to Careline</h2>
        <p className="auth-subtitle">Manage your hospital queue efficiently.</p>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button onClick={onNavigateToSignup}>Sign Up</button>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            className={`auth-input ${errors.email ? "error" : ""}`}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}

          <label className="auth-label">Password</label>
          <input
            className={`auth-input ${errors.password ? "error" : ""}`}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            disabled={isLoading}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}

          <div className="forgot-password">
            <button type="button" onClick={() => toast.info("Forgot password feature coming soon!")}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
