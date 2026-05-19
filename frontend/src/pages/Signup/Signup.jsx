import React, { useState } from "react";
import { useApi } from "../../context/ApiContext";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        setSuccessMessage("Verification successful! Opening your workspace...");
        setTimeout(() => {
          onSignupSuccess();
        }, 1200);
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

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords match failed";

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
        login(data.user, data.token);
        setSuccessMessage("Account created! Experience the future of care.");
        setTimeout(() => onSignupSuccess(), 1500);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Signup error:', error);
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
            <h1 className="auth-headline">Join Careline</h1>
            <p className="auth-subtext">Begin your journey with AI-powered healthcare management.</p>
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
            <span className="divider-text">OR CONTINUE WITH EMAIL</span>
            <span className="divider-line"></span>
          </div>

          <form className="premium-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <div className={`input-wrapper ${errors.fullName ? "error" : ""}`}>
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && <p className="error-hint">{errors.fullName}</p>}
            </div>

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

            <div className="input-row">
              <div className="input-group">
                <label>Password</label>
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
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div className={`input-wrapper ${errors.confirmPassword ? "error" : ""}`}>
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    className="toggle-eye" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            {errors.password && <p className="error-hint">{errors.password}</p>}
            {errors.confirmPassword && <p className="error-hint">{errors.confirmPassword}</p>}

            {errors.general && <div className="general-alert">{errors.general}</div>}
            {successMessage && <div className="success-alert"><Sparkles size={16} /> {successMessage}</div>}

            <button type="submit" className="premium-auth-btn" disabled={isLoading}>
              {isLoading ? <div className="loader-small" /> : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <button onClick={onNavigateToLogin}>Log In</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
