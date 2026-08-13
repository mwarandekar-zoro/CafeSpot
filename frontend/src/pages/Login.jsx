import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect away
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(email, password);
      if (data.success) {
        // Redirect to protected page or fallback to home
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-center page-content container fade-in" style={{ paddingBottom: "64px" }}>
      <div className="glass-md" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "2.5rem" }}>☕</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", marginTop: "12px" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Log in to manage your favorites and share café vibes.
          </p>
        </div>

        {error && (
          <div className="badge badge-error" style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            textTransform: "none",
            fontSize: "0.85rem",
            width: "100%",
            display: "block",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
            style={{ marginTop: "8px" }}
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ textSelf: "center", fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent-light)", fontWeight: "600" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
