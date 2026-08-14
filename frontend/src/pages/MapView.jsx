import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { cafeService } from "../services/cafeService";
import Loading from "../components/Loading";
import "leaflet/dist/leaflet.css";

// ── Category config ──────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Coffee: { icon: "☕", color: "#c8860a" },
  Study:  { icon: "📚", color: "#6e8eff" },
  Work:   { icon: "💻", color: "#4caf6e" },
  Date:   { icon: "❤️", color: "#e05252" },
  Chill:  { icon: "🌙", color: "#a78bfa" },
  Budget: { icon: "💰", color: "#4caf6e" },
};

const PRICE_LABELS = { "$": "Budget", "$$": "Mid-range", "$$$": "Premium" };

// ── Custom Leaflet marker icon factory ───────────────────────────
function createCoffeeMarker(category, isActive = false) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["Coffee"];
  const size   = isActive ? 52 : 44;
  const glow   = isActive ? `drop-shadow(0 0 12px ${cfg.color}cc)` : `drop-shadow(0 4px 8px rgba(0,0,0,0.6))`;
  const ring   = isActive ? `<circle cx="22" cy="22" r="20" fill="none" stroke="${cfg.color}" stroke-width="2.5" opacity="0.7"/>` : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 12}" viewBox="0 0 44 56" style="filter:${glow}">
      ${ring}
      <circle cx="22" cy="22" r="18" fill="${cfg.color}" opacity="0.15"/>
      <circle cx="22" cy="22" r="14" fill="${cfg.color}"/>
      <text x="22" y="28" text-anchor="middle" font-size="14" font-family="serif">${cfg.icon}</text>
      <path d="M22 38 L17 46 Q22 50 27 46 Z" fill="${cfg.color}"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "cafespot-marker",
    iconSize:   [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor:[0, -(size + 12)],
  });
}

// ── Fly-to helper (re-centers map on active cafe) ────────────────
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

// ── Rating stars ─────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span style={{ color: "var(--star-filled)", fontSize: "0.85rem", letterSpacing: "1px" }}>
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "var(--text-secondary)", marginLeft: "6px", fontSize: "0.8rem" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Sidebar Cafe Card ────────────────────────────────────────────
function SidebarCafeCard({ cafe, isActive, onClick }) {
  const cfg = CATEGORY_CONFIG[cafe.category] || CATEGORY_CONFIG["Coffee"];
  return (
    <div
      className="sidebar-cafe-card"
      onClick={() => onClick(cafe)}
      style={{
        display: "flex",
        gap: "12px",
        padding: "14px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: isActive
          ? `1.5px solid ${cfg.color}88`
          : "1.5px solid var(--glass-border)",
        background: isActive
          ? `linear-gradient(135deg, ${cfg.color}14, transparent)`
          : "var(--glass)",
        transition: "all 0.2s ease",
        boxShadow: isActive ? `0 0 20px ${cfg.color}22` : "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: "68px",
        height: "68px",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        flexShrink: 0,
        background: "var(--bg-elevated)",
      }}>
        {cafe.images?.[0] ? (
          <img
            src={cafe.images[0]}
            alt={cafe.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem",
          }}>
            {cfg.icon}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <span style={{
            fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase",
            letterSpacing: "0.08em", color: cfg.color, flexShrink: 0,
          }}>
            {cfg.icon} {cafe.category}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            {cafe.priceRange}
          </span>
        </div>
        <h4 style={{
          fontSize: "0.92rem", fontWeight: "700",
          color: "var(--text-primary)", margin: "0 0 4px",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {cafe.name}
        </h4>
        <div style={{ fontSize: "0.77rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
          📍 {cafe.location}
        </div>
        {cafe.averageRating > 0 && <Stars rating={cafe.averageRating} />}
      </div>
    </div>
  );
}

// ── Main MapView Component ───────────────────────────────────────
export default function MapView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [allCafes, setAllCafes]         = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [activeCafe, setActiveCafe]     = useState(null);
  const [flyTarget, setFlyTarget]       = useState(null);

  const [search, setSearch]     = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [price, setPrice]       = useState(searchParams.get("price") || "");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarRef  = useRef(null);
  const activeCardRef = useRef(null);
  const popupRefs   = useRef({});

  // Fetch ALL cafes (no pagination on map)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const data = await cafeService.getCafes({ limit: 500, page: 1 });
        if (data.success) {
          setAllCafes(data.cafes);
        }
      } catch (err) {
        setError(err.message || "Failed to load cafes.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Client-side filter
  useEffect(() => {
    let result = allCafes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    }
    if (category) result = result.filter(c => c.category === category);
    if (price)    result = result.filter(c => c.priceRange === price);
    setFilteredCafes(result);
  }, [allCafes, search, category, price]);

  // Scroll active card into view in sidebar
  useEffect(() => {
    if (activeCafe && activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeCafe]);

  const handleMarkerClick = useCallback((cafe) => {
    setActiveCafe(cafe);
    if (cafe.lat && cafe.lng) {
      setFlyTarget([cafe.lat, cafe.lng]);
    }
  }, []);

  const handleSidebarCardClick = useCallback((cafe) => {
    setActiveCafe(cafe);
    if (cafe.lat && cafe.lng) {
      setFlyTarget([cafe.lat, cafe.lng]);
      // Open the leaflet popup programmatically
      setTimeout(() => {
        const ref = popupRefs.current[cafe._id];
        if (ref) ref.openPopup();
      }, 900);
    }
  }, []);

  const mapCafes = filteredCafes.filter(c => c.lat && c.lng);

  // ── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - var(--navbar-h))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loading />
      </div>
    );
  }

  return (
    <div className="map-page fade-in">
      {/* ── Left Sidebar ─────────────────────────────────── */}
      <aside className={`map-sidebar${sidebarOpen ? " open" : " closed"}`}>
        {/* Sidebar Header */}
        <div className="map-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "2px",
              }}>
                ☕ CaféSpot Map
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {mapCafes.length} of {allCafes.length} cafés on map
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-ghost btn-sm"
              title="Collapse sidebar"
              style={{ padding: "6px 8px", fontSize: "1rem" }}
            >
              ◀
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginTop: "14px" }}>
            <span style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem",
            }}>🔍</span>
            <input
              type="text"
              className="input"
              placeholder="Search cafés..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: "36px", fontSize: "0.88rem" }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
            {/* Category chips */}
            {Object.entries(CATEGORY_CONFIG).map(([cat, { icon }]) => (
              <button
                key={cat}
                onClick={() => setCategory(prev => prev === cat ? "" : cat)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.72rem",
                  fontWeight: "600",
                  border: category === cat
                    ? "1.5px solid var(--accent)"
                    : "1.5px solid var(--glass-border)",
                  background: category === cat ? "var(--accent-dim)" : "transparent",
                  color: category === cat ? "var(--accent-light)" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: "0.04em",
                }}
              >
                {icon} {cat}
              </button>
            ))}
          </div>

          {/* Price filter */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            {[
              { value: "$",   label: "$ · Budget"   },
              { value: "$$",  label: "$$ · Mid"     },
              { value: "$$$", label: "$$$ · Premium" },
            ].map(({ value: p, label }) => (
              <button
                key={p}
                onClick={() => setPrice(prev => prev === p ? "" : p)}
                style={{
                  flex: 1,
                  padding: "5px 2px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.68rem",
                  fontWeight: "700",
                  letterSpacing: 0,
                  whiteSpace: "nowrap",
                  border: price === p
                    ? "1.5px solid var(--accent)"
                    : "1.5px solid var(--glass-border)",
                  background: price === p ? "var(--accent-dim)" : "transparent",
                  color: price === p ? "var(--accent-light)" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(search || category || price) && (
            <button
              onClick={() => { setSearch(""); setCategory(""); setPrice(""); }}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "8px", width: "100%", fontSize: "0.78rem", color: "var(--text-muted)" }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Cafe list */}
        <div className="map-sidebar-list" ref={sidebarRef}>
          {error ? (
            <p style={{ color: "var(--error)", padding: "16px", fontSize: "0.85rem" }}>{error}</p>
          ) : filteredCafes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "16px", textAlign: "center", fontSize: "0.85rem" }}>
              No cafés match your filters.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 14px" }}>
              {filteredCafes.map(cafe => (
                <div
                  key={cafe._id}
                  ref={activeCafe?._id === cafe._id ? activeCardRef : null}
                >
                  <SidebarCafeCard
                    cafe={cafe}
                    isActive={activeCafe?._id === cafe._id}
                    onClick={handleSidebarCardClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Collapsed sidebar toggle ──────────────────────── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="map-sidebar-reopen"
          title="Open sidebar"
        >
          ▶ <span style={{ fontSize: "0.8rem" }}>Cafés</span>
        </button>
      )}

      {/* ── Map Container ────────────────────────────────── */}
      <div className="map-canvas">
        <MapContainer
          center={[19.0760, 72.8777]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          attributionControl={true}
        >
          {/* CartoDB Dark Matter — free, no API key, dark-themed */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Fly-to helper */}
          {flyTarget && <MapFlyTo center={flyTarget} zoom={14} />}

          {/* Markers */}
          {mapCafes.map(cafe => (
            <Marker
              key={cafe._id}
              position={[cafe.lat, cafe.lng]}
              icon={createCoffeeMarker(cafe.category, activeCafe?._id === cafe._id)}
              ref={el => { if (el) popupRefs.current[cafe._id] = el; }}
              eventHandlers={{
                click: () => handleMarkerClick(cafe),
              }}
            >
              <Popup className="cafespot-popup" maxWidth={300} minWidth={260}>
                <MapPopupCard
                  cafe={cafe}
                  onViewDetails={() => navigate(`/cafes/${cafe._id}`)}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map attribution overlay hint */}
        <div className="map-zoom-hint">
          <span>🖱 Scroll to zoom · Click pin for details</span>
        </div>
      </div>
    </div>
  );
}

// ── Popup Card (rendered inside Leaflet popup) ───────────────────
function MapPopupCard({ cafe, onViewDetails }) {
  const cfg = CATEGORY_CONFIG[cafe.category] || CATEGORY_CONFIG["Coffee"];
  return (
    <div className="map-popup-inner">
      {/* Image */}
      {cafe.images?.[0] && (
        <div style={{ height: "140px", overflow: "hidden", borderRadius: "10px 10px 0 0", margin: "-12px -16px 12px" }}>
          <img
            src={cafe.images[0]}
            alt={cafe.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Category badge */}
          <div style={{
            position: "absolute", top: "10px", left: "10px",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: `${cfg.color}cc`,
            backdropFilter: "blur(8px)",
            fontSize: "0.72rem", fontWeight: "700",
            color: "#fff", letterSpacing: "0.06em",
          }}>
            {cfg.icon} {cafe.category}
          </div>
          {/* Price */}
          <div style={{
            position: "absolute", top: "10px", right: "10px",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            fontSize: "0.78rem", fontWeight: "700",
            color: "var(--accent-light)",
          }}>
            {cafe.priceRange}
          </div>
        </div>
      )}

      {/* Name */}
      <h3 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.05rem",
        fontWeight: "700",
        color: "var(--text-primary)",
        marginBottom: "4px",
        lineHeight: 1.2,
      }}>
        {cafe.name}
      </h3>

      {/* Location */}
      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
        📍 {cafe.address || cafe.location}
      </p>

      {/* Rating */}
      {cafe.averageRating > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ color: "var(--star-filled)", fontSize: "0.9rem" }}>
            {"★".repeat(Math.round(cafe.averageRating))}{"☆".repeat(5 - Math.round(cafe.averageRating))}
          </span>
          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
            {cafe.averageRating.toFixed(1)} · {cafe.reviewCount} reviews
          </span>
        </div>
      )}

      {/* Feature tags */}
      {cafe.features?.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "12px" }}>
          {cafe.features.slice(0, 3).map(f => (
            <span key={f} style={{
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              background: "var(--glass-md)",
              border: "1px solid var(--glass-border)",
              fontSize: "0.68rem",
              color: "var(--text-secondary)",
              fontWeight: "500",
            }}>
              {f}
            </span>
          ))}
          {cafe.features.length > 3 && (
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>+{cafe.features.length - 3}</span>
          )}
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={onViewDetails}
        className="btn btn-primary"
        style={{ width: "100%", fontSize: "0.85rem", padding: "10px 0", fontWeight: "700" }}
      >
        View Details →
      </button>
    </div>
  );
}
