import React from "react";

export default function SearchBar({ value = "", onChange, onSearch, placeholder = "Search cafes..." }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", justifyContent: "center" }}>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch(value);
          }
        }}
        style={{
          flexGrow: 1,
          padding: "10px 16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--glass-border)",
          background: "var(--glass)",
          color: "var(--text-primary)",
          fontSize: "0.95rem",
          outline: "none",
          transition: "all var(--transition)",
          width: "100%"
        }}
      />
      <button
        className="btn btn-primary"
        onClick={() => onSearch && onSearch(value)}
        style={{ padding: "10px 24px", borderRadius: "var(--radius-md)", fontSize: "0.95rem", whiteSpace: "nowrap" }}
      >
        Search
      </button>
    </div>
  );
}
