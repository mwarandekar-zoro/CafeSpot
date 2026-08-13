import React from "react";

export default function Footer() {
  return (
    <footer style={{ padding: "18px 0", textAlign: "center", color: "var(--text-secondary)" }}>
      <div style={{ fontSize: "0.9rem" }}>© {new Date().getFullYear()} CaféSpot</div>
    </footer>
  );
}
