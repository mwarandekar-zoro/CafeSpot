import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "var(--bg-surface)",
      borderTop: "1px solid var(--glass-border)",
      padding: "48px 0 24px 0",
      marginTop: "auto"
    }}>
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "24px"
        }}>
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.4rem" }}>☕</span>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: "700" }}>CaféSpot</span>
            </Link>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "300px" }}>
              Discover local cafés based on your specific vibe. Find the absolute best spots to study, work, dates, or budget hangouts.
            </p>
          </div>

          <div style={{ display: "flex", gap: "48px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h5 style={{ fontSize: "0.88rem", fontWeight: "600", textTransform: "uppercase", color: "var(--text-primary)" }}>Platform</h5>
              <Link to="/cafes" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Browse Cafes</Link>
              <Link to="/add-cafe" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Submit a Spot</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h5 style={{ fontSize: "0.88rem", fontWeight: "600", textTransform: "uppercase", color: "var(--text-primary)" }}>Community</h5>
              <Link to="/favorites" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Favorites</Link>
              <Link to="/profile" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Your Profile</Link>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: 0 }} />

        <div className="flex-between" style={{ flexWrap: "wrap", gap: "12px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <span>© {currentYear} CaféSpot. All rights reserved. Created for premium cafe seekers.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
