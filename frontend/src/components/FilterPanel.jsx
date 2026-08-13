import React from "react";

export default function FilterPanel({
  filters = {},
  onChange,
  onClear,
}) {
  const categories = ["Coffee", "Study", "Work", "Date", "Chill", "Budget"];
  const priceRanges = ["$", "$$", "$$$"];
  const sortOptions = [
    { value: "newest", label: "Newest Spots" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" },
  ];

  const handleFilterChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value === filters[key] ? "" : value, // Toggle filter off if same selected
    });
  };

  return (
    <div className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="flex-between">
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem" }}>Filters & Sort</h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClear}
          style={{ fontSize: "0.78rem" }}
        >
          Clear All
        </button>
      </div>

      {/* Sort */}
      <div className="form-group">
        <label className="form-label">Sort By</label>
        <select
          className="form-input"
          value={filters.sort || "newest"}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="form-group">
        <label className="form-label">Category / Vibe</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {categories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handleFilterChange("category", cat)}
                style={{ borderRadius: "var(--radius-full)" }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="form-group">
        <label className="form-label">Price Range</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {priceRanges.map((price) => {
            const isSelected = filters.price === price;
            return (
              <button
                key={price}
                type="button"
                className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-ghost"}`}
                onClick={() => handleFilterChange("price", price)}
                style={{ flex: 1 }}
              >
                {price}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Rating */}
      <div className="form-group">
        <div className="flex-between">
          <label className="form-label">Min Rating</label>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--accent-light)" }}>
            {filters.minRating ? `${filters.minRating}★` : "Any"}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.minRating || 0}
          onChange={(e) => handleFilterChange("minRating", e.target.value === "0" ? "" : e.target.value)}
          style={{
            width: "100%",
            accentColor: "var(--accent-light)",
            background: "var(--glass-border)",
            height: "6px",
            borderRadius: "3px",
            outline: "none"
          }}
        />
      </div>
    </div>
  );
}
