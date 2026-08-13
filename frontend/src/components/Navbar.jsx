import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "var(--accent-light)" : "var(--text-primary)",
    fontWeight: isActive ? "600" : "500",
    fontSize: "0.92rem",
    letterSpacing: "0.02em",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    transition: "all var(--transition)",
    borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
  });

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: "var(--navbar-h)",
      background: scrolled ? "rgba(10, 10, 12, 0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
      transition: "background var(--transition), border-color var(--transition)"
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
        {/* Brand */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => setMobileMenuOpen(false)}>
          <span style={{ fontSize: "1.6rem" }}>☕</span>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.35rem",
            fontWeight: "700",
            letterSpacing: "0.03em",
            background: "linear-gradient(135deg, var(--text-primary), var(--accent-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            CaféSpot
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }} className="nav-desktop">
          <NavLink to="/" style={navLinkStyle}>Home</NavLink>
          <NavLink to="/cafes" style={navLinkStyle}>Cafes</NavLink>
          {isAuthenticated ? (
            <>
              {(user?.role === "owner" || user?.role === "admin") && (
                <NavLink to="/owner-dashboard" style={navLinkStyle}>Dashboard</NavLink>
              )}
              {user?.role === "visitor" && (
                <NavLink to="/favorites" style={navLinkStyle}>Favorites</NavLink>
              )}
              <NavLink to="/profile" style={navLinkStyle}>Profile</NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: "8px", borderColor: "rgba(224, 82, 82, 0.2)", color: "var(--error)" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ marginLeft: "8px" }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="btn btn-ghost nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none", // Will be shown via CSS media query below
            padding: "8px",
            fontSize: "1.2rem"
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="glass fade-in" style={{
          position: "absolute",
          top: "var(--navbar-h)",
          left: "16px",
          right: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          zIndex: 999
        }}>
          <Link to="/" style={{ padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/cafes" style={{ padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>Cafes</Link>
          {isAuthenticated ? (
            <>
              {(user?.role === "owner" || user?.role === "admin") && (
                <Link to="/owner-dashboard" style={{ padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              )}
              {user?.role === "visitor" && (
                <Link to="/favorites" style={{ padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>Favorites</Link>
              )}
              <Link to="/profile" style={{ padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-full"
                style={{ borderColor: "rgba(224, 82, 82, 0.2)", color: "var(--error)" }}
              >
                Logout ({user?.name})
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
              <Link to="/login" className="btn btn-ghost btn-full" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Inject simple responsive styles to handle visibility directly */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}
