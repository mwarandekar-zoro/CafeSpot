import React from "react";

export default function SearchBar({ value = "", onChange, onSearch }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        type="search"
        placeholder="Search cafes..."
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--glass-border)", background: "transparent", color: "var(--text-primary)" }}
      />
      <button className="btn btn-primary btn-sm" onClick={() => onSearch && onSearch(value)}>Search</button>
    </div>
  );
}
