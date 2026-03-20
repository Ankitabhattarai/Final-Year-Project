import React, { useState } from "react";
import { useApi } from "../../context/ApiContext";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import "./Signup.css";

export default function Signup({ onNavigateToLogin, onNavigateToLanding, onSignupSuccess }) {
  const { apiFetch } = useApi();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrors({});

    try {
      const data = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (data.success) {
        login(data.user, data.token);
        setSuccessMessage("Account verified successfully! Redirecting...");
        setTimeout(() => {
          onSignupSuccess();
        }, 1000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setErrors({ general: error.message || 'Verification failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate Password
    if (!formData.password) {
      newErrors.password = "Please enter a password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Validate Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (data.success) {
        // Verify that a patient account was created
        if (data.user.role !== 'patient') {
          setErrors({ general: 'Error: Account was not created as a patient account. Please contact support.' });
          return;
        }

        login(data.user, data.token);

        setSuccessMessage("Account created successfully! Redirecting...");

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          onSignupSuccess();
        }, 1000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Signup error:', error);
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

        <h2 className="auth-title">Create Your Careline Account</h2>
        <p className="auth-subtitle">Manage your hospital queue efficiently.</p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ general: 'Google Login Failed' })}
          />
        </div>
        
        <div style={{ textAlign: 'center', margin: '15px 0', color: '#6b7280', fontSize: '14px', position: 'relative' }}>
          <span style={{ background: 'white', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR SIGN UP WITH EMAIL</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#e5e7eb', zIndex: 0 }}></div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Full Name</label>
          <input
            className={`auth-input ${errors.fullName ? "error" : ""}`}
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}

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

          <label className="auth-label">Confirm Password</label>
          <input
            className={`auth-input ${errors.confirmPassword ? "error" : ""}`}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            disabled={isLoading}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <button onClick={onNavigateToLogin}>Log In</button>
        </div>
      </div>
    </div>
  );
}
