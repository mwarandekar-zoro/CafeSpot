import React from "react";
import Rating from "./Rating";

export default function ReviewCard({ review, onEdit, onDelete, currentUserId }) {
  if (!review) return null;

  const {
    user,
    createdAt,
    overallRating,
    comment,
    image,
    coffeeRating,
    foodRating,
    ambienceRating,
    wifiRating,
    quietnessRating,
    valueRating,
  } = review;

  const isOwner = currentUserId && user && user._id === currentUserId;
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ratingCategories = [
    { label: "Coffee", val: coffeeRating },
    { label: "Food", val: foodRating },
    { label: "Ambience", val: ambienceRating },
    { label: "Wi-Fi", val: wifiRating },
    { label: "Quietness", val: quietnessRating },
    { label: "Value", val: valueRating },
  ];

  return (
    <div className="glass-flat fade-in" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="flex-between" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "var(--glass-border-strong)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            border: "1px solid var(--glass-border)"
          }}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "👤"
            )}
          </div>
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>{user?.name || "Anonymous User"}</h4>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{formattedDate}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Rating value={overallRating} showText={true} />
          {isOwner && (
            <div style={{ display: "flex", gap: "8px" }}>
              {onEdit && (
                <button onClick={onEdit} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>
                  ✏️
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", borderColor: "rgba(224, 82, 82, 0.2)", color: "var(--error)" }}>
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: "0.92rem", color: "var(--text-primary)", whiteSpace: "pre-line" }}>{comment}</p>

      {image && (
        <div style={{ maxWidth: "200px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
          <img src={image} alt="Review attachment" style={{ width: "100%", height: "auto" }} />
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "8px",
        background: "rgba(255,255,255,0.02)",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.02)"
      }}>
        {ratingCategories.map(({ label, val }) => (
          <div key={label} className="flex-between" style={{ fontSize: "0.78rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>{label}:</span>
            <span style={{ fontWeight: "600", color: "var(--accent-light)" }}>{val}★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
