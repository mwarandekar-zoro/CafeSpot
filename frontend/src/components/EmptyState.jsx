import React from "react";

export default function EmptyState({ icon = "📭", title = "No items", description = "Nothing to show.", actionText, onAction }) {
  return (
    <div className="glass" style={{ padding: "28px", textAlign: "center" }}>
      <div style={{ fontSize: "2.2rem" }}>{icon}</div>
      <h3 style={{ marginTop: "12px", fontFamily: "var(--font-serif)" }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>{description}</p>
      {actionText && onAction && (
        <div style={{ marginTop: "16px" }}>
          <button className="btn btn-primary" onClick={onAction}>{actionText}</button>
        </div>
      )}
    </div>
  );
}
