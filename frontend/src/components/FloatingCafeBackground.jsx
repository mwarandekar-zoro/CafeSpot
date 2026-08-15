import React from "react";

// Coffee Bean SVG element
const CoffeeBean = ({ style }) => (
  <div className="floating-cafe-element" style={style}>
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="18" rx="9" ry="13" fill="#c8860a" opacity="0.4" transform="rotate(35, 18, 18)" />
      <path d="M15 8 Q20 18 15 28" stroke="#5c3804" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  </div>
);

// Another coffee bean variation
const CoffeeBeanDark = ({ style }) => (
  <div className="floating-cafe-element" style={style}>
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="18" rx="8" ry="12" fill="#8b5a2b" opacity="0.35" transform="rotate(-25, 18, 18)" />
      <path d="M19 9 Q15 18 19 27" stroke="#3d2b1f" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  </div>
);

// Mug SVG element with animated steam
const CoffeeMug = ({ style }) => (
  <div className="floating-cafe-element" style={style}>
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 14 L12 28 Q18 30 24 28 L26 14 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" />
      <path d="M26 17 Q31 17 31 21 Q31 25 26 25" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" fill="none" />
      <path d="M14 10 Q15 6 14 3" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M18 10 Q19 5 18 3" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M22 10 Q23 7 22 3" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  </div>
);

// Takeaway Cup SVG element
const TakeawayCup = ({ style }) => (
  <div className="floating-cafe-element" style={style}>
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 12 L13 29 Q18 31 23 29 L25 12 Z" fill="rgba(200, 134, 10, 0.03)" stroke="rgba(200, 134, 10, 0.22)" strokeWidth="1.8" />
      <path d="M12 18 L24 18 L23.5 24 L12.5 24 Z" fill="rgba(200, 134, 10, 0.12)" stroke="rgba(200, 134, 10, 0.25)" strokeWidth="1.2" />
      <path d="M10 12 L26 12 L25 9 L11 9 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" />
    </svg>
  </div>
);

// Map Pin element
const MapPin = ({ style }) => (
  <div className="floating-cafe-element" style={style}>
    <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 4 C12 4 8 8 8 14 C8 21 18 31 18 31 C18 31 28 21 28 14 C28 8 24 4 18 4 Z" fill="rgba(200, 134, 10, 0.03)" stroke="var(--accent)" strokeWidth="1.6" opacity="0.35" />
      <circle cx="18" cy="13" r="3.5" fill="var(--accent-light)" opacity="0.5" />
    </svg>
  </div>
);

export default function FloatingCafeBackground() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 0,
      overflow: "hidden"
    }} className="floating-cafe-bg-container">
      {/* ── Left Side Floating Elements ── */}
      <CoffeeBean
        style={{
          width: "72px",
          height: "72px",
          left: "8%",
          top: "18%",
          animation: "float-y-slow 7s ease-in-out infinite"
        }}
      />
      <CoffeeMug
        style={{
          width: "90px",
          height: "90px",
          left: "14%",
          top: "48%",
          animation: "float-y-slower 9s ease-in-out infinite"
        }}
      />
      <CoffeeBeanDark
        style={{
          width: "60px",
          height: "60px",
          left: "6%",
          top: "78%",
          animation: "float-y-fast 5s ease-in-out infinite"
        }}
      />

      {/* ── Right Side Floating Elements ── */}
      <TakeawayCup
        style={{
          width: "84px",
          height: "84px",
          right: "10%",
          top: "22%",
          animation: "float-y-slower 8s ease-in-out infinite"
        }}
      />
      <MapPin
        style={{
          width: "80px",
          height: "80px",
          right: "15%",
          top: "52%",
          animation: "float-y-slow 6.5s ease-in-out infinite"
        }}
      />
      <CoffeeBean
        style={{
          width: "64px",
          height: "64px",
          right: "8%",
          top: "80%",
          animation: "float-y-fast 5.5s ease-in-out infinite"
        }}
      />
    </div>
  );
}
