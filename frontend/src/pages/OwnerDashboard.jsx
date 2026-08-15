import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { cafeService } from "../services/cafeService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Rating from "../components/Rating";

// ── Helpers ──────────────────────────────────────────────────────
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function shortMonth(yyyyMM) {
  const [y, m] = yyyyMM.split("-");
  return `${MONTH_ABBR[parseInt(m, 10) - 1]} '${y.slice(2)}`;
}

// ── Pure CSS rating bar ───────────────────────────────────────────
function RatingBar({ label, value, max = 5, color = "var(--accent)" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
      <span style={{
        fontSize: "0.75rem", color: "var(--text-secondary)", width: "72px",
        flexShrink: 0, fontWeight: "500",
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: "6px", borderRadius: "999px",
        background: "var(--glass-md)", overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: "999px",
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      </div>
      <span style={{
        fontSize: "0.75rem", fontWeight: "700",
        color: value >= 4 ? "var(--success)" : value >= 3 ? "var(--accent-light)" : "var(--error)",
        width: "28px", textAlign: "right", flexShrink: 0,
      }}>
        {value > 0 ? value.toFixed(1) : "–"}
      </span>
    </div>
  );
}

// ── Spark bar chart (review trend) ───────────────────────────────
function TrendChart({ trend }) {
  if (!trend || trend.length === 0) return null;
  const maxCount = Math.max(...trend.map(t => t.count), 1);

  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "6px",
        height: "52px", padding: "0 2px",
      }}>
        {trend.map(({ month, count }) => (
          <div
            key={month}
            title={`${shortMonth(month)}: ${count} review${count !== 1 ? "s" : ""}`}
            style={{
              flex: 1,
              height: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 3)}%`,
              minHeight: count > 0 ? "6px" : "3px",
              borderRadius: "3px 3px 0 0",
              background: count > 0
                ? "linear-gradient(180deg, var(--accent-light), var(--accent))"
                : "var(--glass-md)",
              transition: "height 0.6s ease",
              cursor: "default",
            }}
          />
        ))}
      </div>
      {/* Month labels */}
      <div style={{ display: "flex", gap: "6px", padding: "4px 2px 0" }}>
        {trend.map(({ month }) => (
          <span key={month} style={{
            flex: 1, textAlign: "center",
            fontSize: "0.6rem", color: "var(--text-muted)",
            overflow: "hidden", whiteSpace: "nowrap",
          }}>
            {shortMonth(month)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="glass" style={{
      padding: "24px 20px",
      display: "flex", flexDirection: "column", gap: "6px",
      position: "relative", overflow: "hidden",
    }}>
      {/* background glow blob */}
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "80px", height: "80px", borderRadius: "50%",
        background: accent || "var(--accent-dim)",
        filter: "blur(28px)", opacity: 0.5, pointerEvents: "none",
      }} />
      <span style={{ fontSize: "1.8rem" }}>{icon}</span>
      <span style={{
        fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em",
        color: "var(--text-muted)", fontWeight: "700", marginTop: "4px",
      }}>
        {label}
      </span>
      <h2 style={{
        fontSize: "2rem", fontWeight: "800", lineHeight: 1,
        color: accent ? "var(--accent-light)" : "var(--text-primary)",
      }}>
        {value}
      </h2>
      {sub && (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub}</span>
      )}
    </div>
  );
}

// ── Cafe analytics card ──────────────────────────────────────────
function CafeAnalyticsCard({ cafe, isBest, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const cover = cafe.images?.[0] || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";
  const r = cafe.ratings || {};

  return (
    <div
      className="glass-flat fade-in"
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: isBest ? "1.5px solid var(--accent)" : "1px solid var(--glass-border)",
        boxShadow: isBest ? "var(--shadow-glow)" : "none",
      }}
    >
      {/* Top row */}
      <div style={{
        display: "flex", gap: "16px", alignItems: "flex-start",
        padding: "18px 20px", flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={cover} alt={cafe.name}
            style={{ width: "88px", height: "68px", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
          />
          {isBest && (
            <span style={{
              position: "absolute", top: "-8px", right: "-8px",
              background: "var(--accent)", color: "#0a0a0c",
              borderRadius: "var(--radius-full)", fontSize: "0.6rem",
              fontWeight: "800", padding: "2px 6px", letterSpacing: "0.06em",
            }}>
              ★ TOP
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: "180px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: "700" }}>
              {cafe.name}
            </h4>
            <span style={{
              fontSize: "0.7rem", padding: "2px 8px", borderRadius: "var(--radius-full)",
              background: "var(--glass-md)", border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)", fontWeight: "600",
            }}>
              {cafe.category}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "700" }}>
              {cafe.priceRange}
            </span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>📍 {cafe.location}</span>
          <div style={{ marginTop: "4px" }}>
            <Rating value={cafe.averageRating} count={cafe.reviewCount} showText={true} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
          <button
            onClick={() => setExpanded(e => !e)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.78rem" }}
          >
            {expanded ? "▲ Less" : "📊 Analytics"}
          </button>
          <Link to={`/cafes/${cafe._id}`} className="btn btn-ghost btn-sm" style={{ fontSize: "0.78rem" }}>
            👁 View
          </Link>
          <button
            onClick={() => onDelete(cafe._id)}
            className="btn btn-ghost btn-sm"
            style={{ borderColor: "rgba(224,82,82,0.2)", color: "var(--error)", fontSize: "0.78rem" }}
          >
            🗑 Remove
          </button>
        </div>
      </div>

      {/* Expandable analytics panel */}
      {expanded && (
        <div style={{
          padding: "0 20px 20px",
          borderTop: "1px solid var(--glass-border)",
          marginTop: "-2px",
          paddingTop: "16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
          className="analytics-expand"
        >
          {/* Category rating breakdown */}
          <div>
            <h5 style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase",
              letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "12px" }}>
              Score Breakdown
            </h5>
            <RatingBar label="Coffee"    value={r.coffee    || 0} color="var(--accent)" />
            <RatingBar label="Food"      value={r.food      || 0} color="#e8804f" />
            <RatingBar label="Ambience"  value={r.ambience  || 0} color="#a78bfa" />
            <RatingBar label="Wi-Fi"     value={r.wifi      || 0} color="#4caf6e" />
            <RatingBar label="Quietness" value={r.quietness || 0} color="#6e8eff" />
            <RatingBar label="Value"     value={r.value     || 0} color="#f0a94a" />
          </div>

          {/* Review trend chart */}
          <div>
            <h5 style={{ fontSize: "0.78rem", fontWeight: "700", textTransform: "uppercase",
              letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "4px" }}>
              Review Trend (6 mo.)
            </h5>
            {cafe.trend && cafe.trend.every(t => t.count === 0) ? (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "16px" }}>
                No reviews yet — they'll appear here once posted.
              </p>
            ) : (
              <TrendChart trend={cafe.trend} />
            )}
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Total: {cafe.allReviewCount || cafe.reviewCount || 0} review{(cafe.allReviewCount || cafe.reviewCount) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main OwnerDashboard ──────────────────────────────────────────
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [cafes, setCafes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getOwnerDashboard();
      if (data.success) {
        setStats(data.stats);
        setCafes(data.cafes);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleCafeDelete = async (cafeId) => {
    if (!window.confirm("Are you sure you want to delete this café spot? This will remove all associated reviews.")) return;
    try {
      const res = await cafeService.deleteCafe(cafeId);
      if (res.success) {
        const remaining = cafes.filter(c => c._id !== cafeId);
        setCafes(remaining);
        setStats(prev => {
          const totalCafes   = remaining.length;
          const totalReviews = remaining.reduce((s, c) => s + (c.reviewCount || 0), 0);
          const avgRating    = totalCafes > 0
            ? Math.round((remaining.reduce((s, c) => s + (c.averageRating || 0), 0) / totalCafes) * 10) / 10
            : 0;
          const best = remaining.length > 0
            ? remaining.reduce((b, c) => c.averageRating > (b?.averageRating || 0) ? c : b, null)
            : null;
          return { ...prev, totalCafes, totalReviews, averageRating: avgRating, bestCafeId: best?._id || null };
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete café.");
    }
  };

  if (loading) return <Loading message="Opening admin dashboard..." />;
  if (error)   return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  // Flatten + sort recent reviews from all cafes
  const recentReviews = cafes
    .flatMap(c => (c.recentReviews || []).map(r => ({ ...r, cafeName: c.name })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Best-performing cafe indicator
  const bestCafeId = stats?.bestCafeId;

  return (
    <div className="container fade-in" style={{ padding: "40px 0 80px 0" }}>

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex-between" style={{ flexWrap: "wrap", gap: "16px", marginBottom: "40px" }}>
        <div>
          <h1 className="section-title">
            Admin <span className="text-accent">Dashboard</span>
          </h1>
          <p className="section-subtitle">
            Manage listings, view customer ratings, and track performance analytics.
          </p>
        </div>
        <Link to="/add-cafe" className="btn btn-primary">
          ➕ List a New Café
        </Link>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      {stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "48px",
        }}>
          <StatCard
            icon="🏪"
            label="Cafés Listed"
            value={stats.totalCafes}
            sub="Active listings"
          />
          <StatCard
            icon="✍️"
            label="Total Reviews"
            value={stats.totalReviews}
            sub="Across all cafés"
          />
          <StatCard
            icon="⭐"
            label="Avg. Rating"
            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
            sub="Portfolio average"
            accent="var(--accent-dim)"
          />
          {stats.totalCafes > 0 && (
            <StatCard
              icon="📊"
              label="Reviews / Café"
              value={stats.totalCafes > 0 ? (stats.totalReviews / stats.totalCafes).toFixed(1) : "0"}
              sub="Average engagement"
            />
          )}
        </div>
      )}

      {/* ── Main content grid ─────────────────────────────── */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>

        {/* Left column — Café analytics cards */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>
              My Café Spots
            </h2>
            {cafes.length > 0 && (
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Click <strong style={{ color: "var(--accent-light)" }}>📊 Analytics</strong> to expand a café's breakdown
              </span>
            )}
          </div>

          {cafes.length === 0 ? (
            <EmptyState
              icon="🏪"
              title="No café spots listed yet"
              description="Start listing your coffee shops to collect customer ratings, feature tags, and reviews."
              actionText="List your first Café"
              onAction={() => navigate("/add-cafe")}
            />
          ) : (
            cafes.map(cafe => (
              <CafeAnalyticsCard
                key={cafe._id}
                cafe={cafe}
                isBest={String(cafe._id) === String(bestCafeId)}
                onDelete={handleCafeDelete}
              />
            ))
          )}
        </div>

        {/* Right column — Recent reviews feed */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "20px" }} className="dashboard-reviews">
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Recent Reviews</h2>

          <div className="glass" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "0" }}>
            {recentReviews.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", padding: "16px 0" }}>
                No reviews yet — they'll appear here when posted.
              </p>
            ) : (
              recentReviews.map((rev, i) => (
                <div
                  key={rev._id}
                  style={{
                    display: "flex", flexDirection: "column", gap: "6px",
                    padding: "14px 0",
                    borderBottom: i < recentReviews.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div className="flex-between">
                    <div style={{ display: "flex", align: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                        {rev.user?.name || "Anonymous"}
                      </span>
                    </div>
                    <span style={{ color: "var(--star-filled)", fontSize: "0.82rem", fontWeight: "700" }}>
                      ★ {rev.overallRating}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-light)", fontWeight: "600" }}>
                    on {rev.cafeName}
                  </span>
                  <p style={{
                    fontSize: "0.8rem", color: "var(--text-secondary)",
                    fontStyle: "italic", lineHeight: "1.5",
                  }}>
                    "{rev.comment.slice(0, 110)}{rev.comment.length > 110 ? "…" : ""}"
                  </p>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick tip box */}
          <div className="glass" style={{
            padding: "16px 18px",
            borderLeft: "3px solid var(--accent)",
            fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6",
          }}>
            <strong style={{ color: "var(--accent-light)", display: "block", marginBottom: "4px" }}>
              💡 Pro Tip
            </strong>
            Respond to reviews by improving your café's amenities. Higher scores in Wi-Fi and Quietness boost your Study Vibe ranking.
          </div>
        </div>
      </div>

      {/* Inline responsive tweak */}
      <style>{`
        @media (max-width: 768px) {
          .analytics-expand { grid-template-columns: 1fr !important; }
          .dashboard-reviews { display: none; }
        }
      `}</style>
    </div>
  );
}
