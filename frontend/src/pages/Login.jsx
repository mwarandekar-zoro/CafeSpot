import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FloatingCafeBackground from "../components/FloatingCafeBackground";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState(null); // null | 'visitor' | 'owner'
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

  if (!selectedRole) {
    return (
      <div className="flex-center page-content container fade-in" style={{ paddingBottom: "64px", position: "relative" }}>
        <FloatingCafeBackground />
        <div style={{ maxWidth: "960px", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem" }}>Choose Your Entrance Vibe</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "480px" }}>
            Select how you want to access the CaféSpot platform today to tailor your experience.
          </p>
          
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", marginTop: "20px" }}>
            {/* Card 1: Explorer */}
            <div className="glass" 
                 onClick={() => setSelectedRole("visitor")}
                 style={{
                   padding: "48px 32px",
                   flex: "1 1 240px",
                   maxWidth: "280px",
                   cursor: "pointer",
                   textAlign: "center",
                   display: "flex",
                   flexDirection: "column",
                   alignItems: "center",
                   gap: "16px",
                   transition: "all var(--transition)"
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = "translateY(-4px)";
                   e.currentTarget.style.borderColor = "var(--accent)";
                   e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = "translateY(0)";
                   e.currentTarget.style.borderColor = "var(--glass-border)";
                   e.currentTarget.style.boxShadow = "none";
                 }}>
              <span style={{ fontSize: "3.5rem" }}>☕</span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Café Explorer</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Discover, review, and save cafés based on your specific vibe.
              </p>
            </div>

            {/* Card 2: Owner */}
            <div className="glass" 
                 onClick={() => setSelectedRole("owner")}
                 style={{
                   padding: "48px 32px",
                   flex: "1 1 240px",
                   maxWidth: "280px",
                   cursor: "pointer",
                   textAlign: "center",
                   display: "flex",
                   flexDirection: "column",
                   alignItems: "center",
                   gap: "16px",
                   transition: "all var(--transition)"
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = "translateY(-4px)";
                   e.currentTarget.style.borderColor = "var(--accent)";
                   e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = "translateY(0)";
                   e.currentTarget.style.borderColor = "var(--glass-border)";
                   e.currentTarget.style.boxShadow = "none";
                 }}>
              <span style={{ fontSize: "3.5rem" }}>🏪</span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Café Owner</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                List and manage your own cafés, view review summaries, and stats.
              </p>
            </div>

            {/* Card 3: Admin */}
            <div className="glass" 
                 onClick={() => setSelectedRole("admin")}
                 style={{
                   padding: "48px 32px",
                   flex: "1 1 240px",
                   maxWidth: "280px",
                   cursor: "pointer",
                   textAlign: "center",
                   display: "flex",
                   flexDirection: "column",
                   alignItems: "center",
                   gap: "16px",
                   transition: "all var(--transition)"
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = "translateY(-4px)";
                   e.currentTarget.style.borderColor = "var(--accent)";
                   e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = "translateY(0)";
                   e.currentTarget.style.borderColor = "var(--glass-border)";
                   e.currentTarget.style.boxShadow = "none";
                 }}>
              <span style={{ fontSize: "3.5rem" }}>🛡️</span>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Administrator</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                List and manage all cafés, view portfolio metrics, and performance stats.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center page-content container fade-in" style={{ paddingBottom: "64px", position: "relative" }}>
      <FloatingCafeBackground />
      <div className="glass-md" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        <button
          onClick={() => setSelectedRole(null)}
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "var(--accent-light)",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          ← Change Role
        </button>

        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "2.5rem" }}>☕</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", marginTop: "12px" }}>
            Login as {selectedRole === "admin" ? "Administrator" : selectedRole === "owner" ? "Café Owner" : "Café Explorer"}
          </h2>
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
