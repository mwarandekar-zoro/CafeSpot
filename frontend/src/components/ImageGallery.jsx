import React, { useState, useEffect, useCallback } from "react";

export default function ImageGallery({ images = [], category = "Coffee" }) {
  const defaultImage = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";
  const galleryImages = images.length > 0 ? images : [defaultImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = galleryImages[activeIndex];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }, [galleryImages]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  }, [galleryImages]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* ── Main Display Image ── */}
      <div
        className="glass image-gallery-main-container"
        onClick={() => setLightboxOpen(true)}
        style={{
          overflow: "hidden",
          position: "relative",
          height: "300px",
          cursor: "pointer",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--glass-border)"
        }}
      >
        <img
          src={activeImage}
          alt={`Café gallery main view`}
          className="gallery-zoom-img"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease"
          }}
        />
        {/* Category tag */}
        <span className="badge badge-accent" style={{ position: "absolute", top: "16px", left: "16px", zIndex: 1 }}>
          {category}
        </span>
        {/* Click to expand hint overlay */}
        <div className="gallery-hover-overlay" style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          opacity: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: "600",
          letterSpacing: "0.03em",
          transition: "opacity 0.25s ease",
          zIndex: 2
        }}>
          🔍 View Fullscreen
        </div>
      </div>

      {/* ── Thumbnails Strip ── */}
      {galleryImages.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "6px"
          }}
          className="scrollbar-custom"
        >
          {galleryImages.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  cursor: "pointer",
                  flexShrink: 0,
                  border: isActive
                    ? "2px solid var(--accent)"
                    : "2px solid var(--glass-border)",
                  boxShadow: isActive ? "0 0 10px rgba(200, 134, 10, 0.4)" : "none",
                  transition: "all var(--transition)",
                  background: "var(--bg-elevated)"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = "var(--glass-border)";
                }}
              >
                <img
                  src={img}
                  alt={`Café gallery thumbnail ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lightbox Modal Overlay ── */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay fade-in"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 10, 12, 0.96)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none"
          }}
        >
          {/* Top Close Bar */}
          <div style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            right: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            fontWeight: "600",
            zIndex: 10001
          }}>
            <span>Photo {activeIndex + 1} of {galleryImages.length}</span>
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all var(--transition)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(224, 82, 82, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
            >
              ✕
            </button>
          </div>

          {/* Left Arrow */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="lightbox-nav-btn"
              style={{
                position: "absolute",
                left: "24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%",
                width: "56px",
                height: "56px",
                fontSize: "1.8rem",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10000,
                transition: "all var(--transition)"
              }}
            >
              ⟨
            </button>
          )}

          {/* Core Fullscreen Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "85vw",
              maxHeight: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src={activeImage}
              alt="Café details full view"
              className="lightbox-image-scale"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.8)"
              }}
            />
          </div>

          {/* Right Arrow */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="lightbox-nav-btn"
              style={{
                position: "absolute",
                right: "24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%",
                width: "56px",
                height: "56px",
                fontSize: "1.8rem",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10000,
                transition: "all var(--transition)"
              }}
            >
              ⟩
            </button>
          )}

          {/* Esc key prompt bottom */}
          <span style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}>
            Esc to close • Navigation with Left/Right Keys
          </span>
        </div>
      )}

      {/* Styled JSX for Lightbox entry zoom & hover overlay */}
      <style>{`
        .image-gallery-main-container:hover .gallery-zoom-img {
          transform: scale(1.04);
        }
        .image-gallery-main-container:hover .gallery-hover-overlay {
          opacity: 1;
        }
        .lightbox-image-scale {
          animation: scale-entry 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scale-entry {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .lightbox-nav-btn:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: var(--accent) !important;
          color: var(--accent-light) !important;
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}
