import React from "react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
        <div className="spinner" style={{ marginBottom: "10px" }}>⏳</div>
        <div style={{ fontSize: "0.95rem" }}>{message}</div>
      </div>
    </div>
  );
}
