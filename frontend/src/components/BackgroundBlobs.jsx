import React from "react";

/**
 * Fixed, full-viewport layer of soft blurred gradient blobs that sits
 * behind the entire app. Glassmorphism only reads as "glass" when
 * there's something colorful underneath to refract — this is that layer.
 *
 * Mounted once in App.jsx, above <Navbar /> in the DOM but visually
 * behind everything via position: fixed + z-index: -1.
 */
export default function BackgroundBlobs() {
  return (
    <div className="bg-blobs" aria-hidden="true">
      <div className="blob blob-amber" />
      <div className="blob blob-coffee" />
      <div className="blob blob-plum" />
    </div>
  );
}
