import React from "react";

export default function FilterPanel({ category, price, onChange }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <select value={category || ""} onChange={(e) => onChange && onChange({ category: e.target.value })}>
        <option value="">All Categories</option>
        <option value="Coffee">Coffee</option>
        <option value="Study">Study</option>
        <option value="Work">Work</option>
        <option value="Date">Date</option>
        <option value="Chill">Chill</option>
        <option value="Budget">Budget</option>
      </select>

      <select value={price || ""} onChange={(e) => onChange && onChange({ price: e.target.value })}>
        <option value="">Any Price</option>
        <option value="$">$</option>
        <option value="$$">$$</option>
        <option value="$$$">$$$</option>
      </select>
    </div>
  );
}
