import React from "react";

export default function ErrorMessage({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="glass flex-center fade-in w-full" style={{
      padding: "24px",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "500px",
      margin: "40px auto",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "2.5rem" }}>⚠️</div>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem" }}>Oops! An error occurred</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{message}</p>
      {onRetry && (
        <button className="btn btn-primary btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
