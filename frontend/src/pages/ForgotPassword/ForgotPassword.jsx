import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const { apiFetch } = useApi();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (data.success) {
        setStatus({ type: "success", message: "If an account exists, a reset link has been sent to your email." });
        setEmail("");
      } else {
        setStatus({ type: "error", message: data.message || "Failed to send reset email." });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
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

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a password reset link.</p>

        {status.message && (
          <div className={status.type === "error" ? "error-message general-error" : "success-message"}>
            {status.message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading || status.type === "success"}
          />

          <button type="submit" className="auth-btn" disabled={isLoading || status.type === "success"}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
