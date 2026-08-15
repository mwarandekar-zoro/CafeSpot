import React from "react";

// Inline Illustration routing
function EmptyIllustration({ icon }) {
  if (icon === "☕") {
    // Café Empty State
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 16px" }}>
        <circle cx="60" cy="60" r="48" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
        <path d="M34 76 L86 76 Q92 76 92 80 Q92 84 86 84 L34 84 Q28 84 28 80 Q28 76 34 76 Z" fill="rgba(200, 134, 10, 0.05)" stroke="rgba(200, 134, 10, 0.4)" strokeWidth="2" />
        <path d="M42 46 L45 70 C46 74 50 76 60 76 C70 76 74 74 75 70 L78 46 Z" fill="rgba(255, 255, 255, 0.04)" stroke="var(--accent)" strokeWidth="2.5" />
        <path d="M78 52 Q88 52 88 59 Q88 66 77 66" stroke="var(--accent)" strokeWidth="2" fill="none" />
        <path d="M52 38 Q55 30 52 24" stroke="var(--accent-light)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        <path d="M60 38 Q63 28 60 22" stroke="var(--accent-light)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        <path d="M68 38 Q71 32 68 26" stroke="var(--accent-light)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  if (icon === "✍️") {
    // Reviews Empty State
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 16px" }}>
        <circle cx="60" cy="60" r="48" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
        <rect x="40" y="32" width="40" height="52" rx="4" fill="rgba(255, 255, 255, 0.03)" stroke="var(--accent)" strokeWidth="2.5" />
        <line x1="48" y1="44" x2="68" y2="44" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="52" x2="72" y2="52" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="60" x2="64" y2="60" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="68" x2="70" y2="68" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2" strokeLinecap="round" />
        <path d="M72 40 L84 28 C85.5 26.5 88 26.5 89.5 28 C91 29.5 91 32 89.5 33.5 L77.5 45.5 L72 40 Z" fill="rgba(200, 134, 10, 0.2)" stroke="var(--accent-light)" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "💖") {
    // Favorites Empty State
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 16px" }}>
        <circle cx="60" cy="60" r="48" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
        <path d="M60 78 C60 78 32 60 32 44 C32 32 42 26 50 26 C55 26 58 29 60 31 C62 29 65 26 70 26 C78 26 88 32 88 44 C88 60 60 78 60 78 Z" fill="rgba(224, 82, 82, 0.05)" stroke="#e05252" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M26 36 L22 36 M30 26 L27 29" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M90 32 L94 30 M92 42 L96 42" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Search Empty State (No results match)
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 16px" }}>
      <circle cx="60" cy="60" r="48" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
      <circle cx="54" cy="54" r="16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M66 66 L86 86" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="34" cy="38" r="2" fill="var(--text-muted)" />
      <circle cx="82" cy="42" r="3" fill="var(--accent-light)" opacity="0.5" />
      <circle cx="42" cy="78" r="1.5" fill="var(--text-muted)" />
      <path d="M54 50 L54 56 M54 58 L54 59" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyState({ icon = "📭", title = "No items", description = "Nothing to show.", actionText, onAction }) {
  return (
    <div className="glass-md fade-in" style={{ padding: "48px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Dynamic Themed SVG Illustration */}
      <EmptyIllustration icon={icon} />

      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 8px 0" }}>
        {title}
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px", margin: "0 0 20px 0", lineHeight: "1.5" }}>
        {description}
      </p>
      {actionText && onAction && (
        <div>
          <button className="btn btn-primary" onClick={onAction}>{actionText}</button>
        </div>
      )}
    </div>
  );
}
