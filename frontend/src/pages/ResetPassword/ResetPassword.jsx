import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import "../ForgotPassword/ForgotPassword.css"; // Reuse styling

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await apiFetch(`/auth/reset-password/${token}`, {
        method: "PUT",
        body: JSON.stringify({ password: formData.password }),
      });

      if (data.success) {
        setStatus({ type: "success", message: "Password reset successfully. Redirecting to login..." });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setStatus({ type: "error", message: data.message || "Failed to reset password." });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setStatus({ type: "error", message: error.message || "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <div className="logo-box">H</div>
          <span className="logo-title">Careline</span>
        </div>

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Create a new password for your account.</p>

        {status.message && (
          <div className={status.type === "error" ? "error-message general-error" : "success-message"}>
            {status.message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">New Password</label>
          <input
            className="auth-input"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter new password"
            disabled={isLoading || status.type === "success"}
          />

          <label className="auth-label">Confirm Password</label>
          <input
            className="auth-input"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            disabled={isLoading || status.type === "success"}
          />

          <button type="submit" className="auth-btn" disabled={isLoading || status.type === "success"}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
