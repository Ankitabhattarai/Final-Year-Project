import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import "./Login.css";

export default function Login({ onNavigateToSignup, onNavigateToLanding, onLoginSuccess }) {
  const { apiFetch } = useApi();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
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
        setSuccessMessage(`Welcome, ${data.user.fullName}! Redirecting...`);
        onLoginSuccess(data.user);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ general: error.message || 'Verification failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
        login(data.user, data.token);
        setSuccessMessage(`Welcome back, ${data.user.fullName}! Redirecting...`);
        onLoginSuccess(data.user);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Connection lost. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="noise" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <button className="premium-back-btn" onClick={onNavigateToLanding}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="auth-card-wrapper animate-in">
        <div className="auth-card-premium">
          <div className="auth-header">
            <div className="premium-logo">
              <div className="logo-mark-small">C</div>
              <span className="logo-name-small">Care<span>line</span></span>
            </div>
            <h1 className="auth-headline">Welcome Back</h1>
            <p className="auth-subtext">Efficiency starts with a single sign-in.</p>
          </div>

          <div className="google-auth-section">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrors({ general: 'Google Verification Failed' })}
              theme="outline"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>

          <div className="divider">
            <span className="divider-line"></span>
            <span className="divider-text">OR SIGN IN WITH EMAIL</span>
            <span className="divider-line"></span>
          </div>

          <form className="premium-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <div className={`input-wrapper ${errors.email ? "error" : ""}`}>
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="error-hint">{errors.email}</p>}
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                  Forgot?
                </Link>
              </div>
              <div className={`input-wrapper ${errors.password ? "error" : ""}`}>
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="toggle-eye" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-hint">{errors.password}</p>}
            </div>

            {errors.general && <div className="general-alert">{errors.general}</div>}
            {successMessage && <div className="success-alert"><Sparkles size={16} /> {successMessage}</div>}

            <button type="submit" className="premium-auth-btn" disabled={isLoading}>
              {isLoading ? <div className="loader-small" /> : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <button onClick={onNavigateToSignup}>Sign Up</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

