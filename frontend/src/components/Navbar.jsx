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
    <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
        {/* Brand */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }} onClick={() => setMobileMenuOpen(false)}>
          {/* Coffee bean inside map-pin SVG logo */}
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pin outline */}
            <path
              d="M18 2C10.268 2 4 8.268 4 16c0 10 14 24 14 24S32 26 32 16C32 8.268 25.732 2 18 2Z"
              fill="url(#pinGrad)"
              stroke="rgba(200,134,10,0.4)"
              strokeWidth="1"
            />
            {/* Coffee bean body */}
            <ellipse cx="18" cy="15" rx="7" ry="9" fill="#1a0e05" stroke="none" />
            {/* Bean center crease */}
            <path
              d="M18 7.5 Q21.5 11 18 15 Q14.5 19 18 22.5"
              stroke="#c8860a"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Bean left arc */}
            <path
              d="M13.5 11 Q11 15 13.5 19"
              stroke="rgba(232,164,53,0.5)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            {/* Bean right arc */}
            <path
              d="M22.5 11 Q25 15 22.5 19"
              stroke="rgba(232,164,53,0.5)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="pinGrad" x1="4" y1="2" x2="32" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e8a435" />
                <stop offset="100%" stopColor="#c8860a" />
              </linearGradient>
            </defs>
          </svg>
          {/* Wordmark */}
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.35rem",
            fontWeight: "700",
            letterSpacing: "0.04em",
            background: "linear-gradient(135deg, var(--text-primary), var(--accent-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            CaféSpot
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }} className="nav-desktop">
          <NavLink to="/" style={navLinkStyle}>Home</NavLink>
          <NavLink to="/cafes" style={navLinkStyle}>Cafes</NavLink>
          <NavLink to="/map" style={navLinkStyle}>🗺 Map</NavLink>
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
        <div className="navbar-mobile-menu fade-in" style={{
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
          <Link to="/map" style={{ padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>🗺 Map</Link>
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
