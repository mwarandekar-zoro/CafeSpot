import React from "react";

export default function VibeScore({ vibes }) {
  if (!vibes) return null;

  const vibeItems = [
    { key: "study", label: "Study Vibe", icon: "📚" },
    { key: "work", label: "Work Vibe", icon: "💻" },
    { key: "date", label: "Date Spot", icon: "❤️" },
    { key: "coffee", label: "Coffee Quality", icon: "☕" },
    { key: "chill", label: "Chill Vibe", icon: "🌙" },
    { key: "budget", label: "Budget Friendly", icon: "💰" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      {vibeItems.map(({ key, label, icon }) => {
        const score = vibes[key] || 0;
        const percentage = (score / 5) * 100;
        return (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="flex-between" style={{ fontSize: "0.82rem", fontWeight: "600" }}>
              <span className="flex-center" style={{ gap: "6px" }}>
                <span>{icon}</span>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              </span>
              <span style={{ color: "var(--accent-light)" }}>{score.toFixed(1)} / 5.0</span>
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "3px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.03)"
            }}>
              <div style={{
                width: `${percentage}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                borderRadius: "3px",
                transition: "width 0.8s ease-out-in"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
