import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--glass-border)",
      background: "rgba(10, 10, 12, 0.4)",
      backdropFilter: "var(--blur-md)",
      padding: "60px 0 40px 0",
      marginTop: "auto",
      color: "var(--text-secondary)",
    }}>
      <div className="container" style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "40px",
      }}>
        {/* Brand column */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* SVG Logo matching Navbar */}
            <svg width="28" height="32" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 2C10.268 2 4 8.268 4 16c0 10 14 24 14 24S32 26 32 16C32 8.268 25.732 2 18 2Z"
                fill="url(#footPinGrad)"
                stroke="rgba(200,134,10,0.4)"
                strokeWidth="1"
              />
              <ellipse cx="18" cy="15" rx="7" ry="9" fill="#1a0e05" stroke="none" />
              <path
                d="M18 7.5 Q21.5 11 18 15 Q14.5 19 18 22.5"
                stroke="#c8860a"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <defs>
                <linearGradient id="footPinGrad" x1="4" y1="2" x2="32" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e8a435" />
                  <stop offset="100%" stopColor="#c8860a" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: "700",
              letterSpacing: "0.04em",
              color: "var(--text-primary)"
            }}>
              CaféSpot
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.6", maxWidth: "280px", color: "var(--text-muted)", margin: 0 }}>
            Find the perfect café spot in Mumbai tailored to your specific vibe—whether you need quiet study hours or a cozy date setting.
          </p>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "12px" }}>
            © {new Date().getFullYear()} CaféSpot, Inc. All rights reserved.
          </div>
        </div>

        {/* Links Columns container */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "60px",
          flex: "1 1 auto",
          justifyContent: "flex-end"
        }}
          className="footer-links-wrap"
        >
          {/* Column 1 - Explore */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "120px" }}>
            <h5 style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.08em", color: "var(--text-primary)", margin: 0 }}>
              Explore
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/cafes" className="footer-link">All Cafés</Link>
              <Link to="/map" className="footer-link">Map View</Link>
            </div>
          </div>

          {/* Column 2 - Vibes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "120px" }}>
            <h5 style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.08em", color: "var(--text-primary)", margin: 0 }}>
              Vibes
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <Link to="/cafes?category=Study" className="footer-link">📚 Study Spots</Link>
              <Link to="/cafes?category=Work" className="footer-link">💻 Work Spaces</Link>
              <Link to="/cafes?category=Date" className="footer-link">❤️ Date Cafés</Link>
            </div>
          </div>

          {/* Column 3 - Admin */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "120px" }}>
            <h5 style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.08em", color: "var(--text-primary)", margin: 0 }}>
              Admin
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <Link to="/admin-dashboard" className="footer-link">Dashboard</Link>
              <Link to="/add-cafe" className="footer-link">Add a Café</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
