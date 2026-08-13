import React from "react";

export default function EmptyState({
  title = "No cafes found",
  description = "Try adjusting your search or filters to find what you are looking for.",
  icon = "☕",
  actionText,
  onAction,
}) {
  return (
    <div className="glass flex-center fade-in w-full" style={{
      padding: "48px 24px",
      flexDirection: "column",
      gap: "12px",
      textAlign: "center",
      maxWidth: "600px",
      margin: "40px auto"
    }}>
      <div style={{ fontSize: "3.5rem", marginBottom: "8px" }}>{icon}</div>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "400px" }}>{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm mt-4" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
