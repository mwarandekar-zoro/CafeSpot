import React from "react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "16px" }}>
      <div style={{ position: "relative", width: "48px", height: "48px" }}>
        {/* Spinner ring */}
        <div className="themed-spinner-ring" />
        {/* Core pulsing bean */}
        <div className="themed-spinner-bean">☕</div>
      </div>
      {message && (
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {message}
        </span>
      )}

      <style>{`
        @keyframes themed-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes themed-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
        .themed-spinner-ring {
          width: 100%;
          height: 100%;
          border: 3px solid rgba(232, 164, 53, 0.1);
          border-top: 3px solid var(--accent);
          border-right: 3px solid var(--accent);
          border-radius: 50%;
          animation: themed-spin 0.8s linear infinite;
        }
        .themed-spinner-bean {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1);
          font-size: 1.3rem;
          line-height: 1;
          animation: themed-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
