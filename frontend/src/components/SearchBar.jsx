import React, { useState, useEffect } from "react";

export default function SearchBar({
  value: initialValue = "",
  onChange,
  placeholder = "Search by name, location, or description...",
  debounceMs = 400,
}) {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, onChange, debounceMs]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <span style={{
        position: "absolute",
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "1.2rem",
        pointerEvents: "none",
        opacity: 0.6
      }}>🔍</span>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        style={{
          paddingLeft: "48px",
          height: "50px",
          borderRadius: "var(--radius-lg)",
          fontSize: "1rem"
        }}
      />
      {localValue && (
        <button
          onClick={() => setLocalValue("")}
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            fontSize: "1rem",
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
