import React from "react";

export default function Loading({ message = "Brewing your experience..." }) {
  return (
    <div className="flex-center mt-4 w-full" style={{ minHeight: "200px", flexDirection: "column", gap: "16px" }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "4px solid var(--glass-border)",
        borderTop: "4px solid var(--accent)",
        borderRadius: "50%",
        animation: "pulse-spin 1.5s infinite linear"
      }}></div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", letterSpacing: "0.03em" }}>{message}</p>
    </div>
  );
}
