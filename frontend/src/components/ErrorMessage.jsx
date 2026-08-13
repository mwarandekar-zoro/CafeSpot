import React from "react";

export default function ErrorMessage({ message = "An error occurred.", onRetry }) {
  return (
    <div className="glass" style={{ padding: "20px", textAlign: "center" }}>
      <div style={{ fontSize: "1rem", color: "var(--error)", marginBottom: "8px" }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary btn-sm">Retry</button>
      )}
    </div>
  );
}
