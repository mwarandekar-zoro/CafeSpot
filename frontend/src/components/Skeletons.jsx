import React from "react";

// Helper: Shimmering block element
export function SkeletonBlock({ width = "100%", height = "16px", borderRadius = "4px", style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

// ── 1. Cafe Card Skeleton ─────────────────────────────────────────
export function CafeCardSkeleton() {
  return (
    <div className="glass-flat cafe-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Image area placeholder */}
      <div style={{ height: "200px", width: "100%", position: "relative", overflow: "hidden" }}>
        <SkeletonBlock width="100%" height="100%" borderRadius="0" />
      </div>

      {/* Body area */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1 }}>
        {/* Title */}
        <div>
          <SkeletonBlock width="65%" height="20px" style={{ marginBottom: "6px" }} />
          {/* Location / Price */}
          <SkeletonBlock width="40%" height="12px" />
        </div>

        {/* Vibe Tags */}
        <div style={{ display: "flex", gap: "8px", margin: "4px 0" }}>
          <SkeletonBlock width="60px" height="22px" borderRadius="100px" />
          <SkeletonBlock width="60px" height="22px" borderRadius="100px" />
        </div>

        {/* Snippet text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
          <SkeletonBlock width="95%" height="10px" />
          <SkeletonBlock width="80%" height="10px" />
        </div>

        {/* View Spot link */}
        <div style={{ marginTop: "auto", paddingTop: "8px" }}>
          <SkeletonBlock width="70px" height="14px" />
        </div>
      </div>
    </div>
  );
}

// ── 2. Review Card Skeleton ───────────────────────────────────────
export function ReviewCardSkeleton() {
  return (
    <div className="glass-flat" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="flex-between" style={{ width: "100%" }}>
        {/* User avatar & info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SkeletonBlock width="40px" height="40px" borderRadius="50%" />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <SkeletonBlock width="110px" height="14px" />
            <SkeletonBlock width="70px" height="10px" />
          </div>
        </div>
        {/* Overall rating block */}
        <SkeletonBlock width="64px" height="20px" />
      </div>

      {/* Comment text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <SkeletonBlock width="98%" height="11px" />
        <SkeletonBlock width="92%" height="11px" />
        <SkeletonBlock width="55%" height="11px" />
      </div>

      {/* Sub-ratings grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "10px",
        background: "rgba(255,255,255,0.01)",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.01)"
      }}>
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="flex-between">
            <SkeletonBlock width="45px" height="10px" />
            <SkeletonBlock width="25px" height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. Cafe Details Page Skeleton ────────────────────────────────
export function CafeDetailsSkeleton() {
  return (
    <div className="container" style={{ padding: "40px 0 64px 0" }}>
      {/* Back link placeholder */}
      <SkeletonBlock width="120px" height="14px" style={{ marginBottom: "20px" }} />

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* Left Column */}
        <div style={{ flex: "1 1 360px", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Image */}
          <div className="glass" style={{ height: "300px", overflow: "hidden" }}>
            <SkeletonBlock width="100%" height="100%" borderRadius="0" />
          </div>
          {/* Vibe Score summary */}
          <div className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <SkeletonBlock width="100px" height="18px" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="flex-between">
                  <SkeletonBlock width="50px" height="10px" />
                  <SkeletonBlock width="30px" height="10px" />
                </div>
                <SkeletonBlock width="100%" height="6px" borderRadius="10px" />
              </div>
            ))}
          </div>
          {/* Features tag cloud */}
          <div className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <SkeletonBlock width="130px" height="18px" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <SkeletonBlock width="60px" height="24px" borderRadius="100px" />
              <SkeletonBlock width="75px" height="24px" borderRadius="100px" />
              <SkeletonBlock width="55px" height="24px" borderRadius="100px" />
              <SkeletonBlock width="80px" height="24px" borderRadius="100px" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Header Metadata card */}
          <div className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="flex-between">
              <SkeletonBlock width="50%" height="32px" />
              <SkeletonBlock width="60px" height="24px" />
            </div>
            <SkeletonBlock width="40%" height="14px" />
            <div className="divider" />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <SkeletonBlock width="100%" height="12px" />
              <SkeletonBlock width="95%" height="12px" />
              <SkeletonBlock width="80%" height="12px" />
            </div>
            <div className="divider" />
            {/* Highlights */}
            <SkeletonBlock width="160px" height="14px" style={{ marginBottom: "8px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[1, 2].map((i) => (
                <div key={i} className="glass-flat" style={{ padding: "16px", display: "flex", gap: "12px" }}>
                  <SkeletonBlock width="28px" height="28px" borderRadius="50%" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                    <SkeletonBlock width="70%" height="12px" />
                    <SkeletonBlock width="90%" height="10px" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Write review preview box */}
          <div className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <SkeletonBlock width="140px" height="20px" />
            <SkeletonBlock width="100%" height="80px" />
            <SkeletonBlock width="100px" height="36px" style={{ alignSelf: "flex-end" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
