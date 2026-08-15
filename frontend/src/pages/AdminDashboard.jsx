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

// ── Spark bar chart (average rating trend) ─────────────────────────
function TrendChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "6px",
        height: "52px", padding: "0 2px",
      }}>
        {trend.map(({ month, count, avgRating }) => {
          const rating = avgRating || 0;
          const barColor = rating >= 4.0 
            ? "linear-gradient(180deg, var(--success), var(--success)bb)" 
            : rating >= 3.0 
              ? "linear-gradient(180deg, var(--accent-light), var(--accent))" 
              : "linear-gradient(180deg, var(--error), var(--error)bb)";
          
          return (
            <div
              key={month}
              title={`${shortMonth(month)}: ${rating > 0 ? rating.toFixed(1) + "★" : "No rating"} (${count} review${count !== 1 ? "s" : ""})`}
              style={{
                flex: 1,
                height: `${rating > 0 ? (rating / 5) * 100 : 8}%`,
                minHeight: "4px",
                borderRadius: "3px 3px 0 0",
                background: rating > 0 ? barColor : "var(--glass-md)",
                transition: "height 0.6s ease",
                cursor: "default",
              }}
            />
          );
        })}
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

// ── User Signups over time chart ──────────────────────────────────
function SignupsBarChart({ trend }) {
  if (!trend || trend.length === 0) return null;
  const maxCount = Math.max(...trend.map(t => t.count), 1);

  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "8px",
        height: "120px", padding: "0 2px",
      }}>
        {trend.map(({ date, count }) => {
          const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          return (
            <div
              key={date}
              title={`${formattedDate}: ${count} signup${count !== 1 ? "s" : ""}`}
              style={{
                flex: 1,
                height: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 3)}%`,
                minHeight: count > 0 ? "6px" : "3px",
                borderRadius: "4px 4px 0 0",
                background: count > 0
                  ? "linear-gradient(180deg, var(--accent-light), var(--accent))"
                  : "var(--glass-md)",
                transition: "height 0.6s ease",
                cursor: "default",
              }}
            />
          );
        })}
      </div>
      {/* Date labels */}
      <div style={{ display: "flex", gap: "8px", padding: "8px 2px 0" }}>
        {trend.map(({ date }) => {
          const label = new Date(date).toLocaleDateString("en-IN", { day: "numeric" });
          return (
            <span key={date} style={{
              flex: 1, textAlign: "center",
              fontSize: "0.65rem", color: "var(--text-muted)",
              overflow: "hidden", whiteSpace: "nowrap",
            }}>
              {label}
            </span>
          );
        })}
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

  const creatorName = cafe.createdBy?.name || "Unknown Owner";
  const creatorRole = cafe.createdBy?.role
    ? cafe.createdBy.role.charAt(0).toUpperCase() + cafe.createdBy.role.slice(1)
    : "Unknown Role";

  return (
    <div
      className="glass-flat fade-in"
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: isBest ? "1.5px solid var(--accent)" : "1px solid var(--glass-border)",
        boxShadow: isBest ? "var(--shadow-glow)" : "none",
        marginBottom: "16px"
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
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>📍 {cafe.location}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              👤 Added by: <strong>{creatorName}</strong> ({creatorRole})
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
            <Rating value={cafe.averageRating} count={cafe.reviewCount} showText={true} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>•</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              👁️ {cafe.views || 0} page view{cafe.views !== 1 ? "s" : ""}
            </span>
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

// ── Main AdminDashboard ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("listings"); // "listings" or "users"
  
  // Stats & Listings states
  const [stats, setStats]   = useState(null);
  const [cafes, setCafes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  // User list states
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getAdminDashboard();
      if (data.success) {
        setStats(data.stats);
        setCafes(data.cafes);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersData = async () => {
    try {
      setUsersLoading(true);
      const data = await userService.getAllUsers();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load user database:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUsersData();
  }, []);

  const handleCafeDelete = async (cafeId) => {
    if (!window.confirm("Are you sure you want to delete this café spot? This will remove all associated reviews from the system.")) return;
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
          return { ...prev, totalCafes, totalReviews, averageRating: avgRating };
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete café.");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to moderate/delete this review?")) return;
    try {
      const res = await cafeService.deleteCafeReview(reviewId);
      if (res.success) {
        setCafes(prev => prev.map(c => {
          const filteredReviews = (c.recentReviews || []).filter(r => r._id !== reviewId);
          const hadReview = (c.recentReviews || []).some(r => r._id === reviewId);
          return {
            ...c,
            recentReviews: filteredReviews,
            reviewCount: hadReview ? Math.max(c.reviewCount - 1, 0) : c.reviewCount
          };
        }));
        setStats(prev => prev ? { ...prev, totalReviews: Math.max(prev.totalReviews - 1, 0) } : prev);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete review.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await userService.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        
        // Refresh aggregate count stats dynamically
        setStats(prev => {
          if (!prev) return prev;
          const updatedUsers = users.map(u => u._id === userId ? { ...u, role: newRole } : u);
          return {
            ...prev,
            adminCount: updatedUsers.filter(u => u.role === "admin").length,
            ownerCount: updatedUsers.filter(u => u.role === "owner").length,
            visitorCount: updatedUsers.filter(u => u.role === "visitor").length
          };
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update user role.");
    }
  };

  const handleStatusToggle = async (userId) => {
    try {
      const res = await userService.toggleUserStatus(userId);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update user account status.");
    }
  };

  if (loading) return <Loading message="Opening Admin Dashboard..." />;
  if (error)   return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  // Filter users based on query
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Flatten + sort recent reviews from all cafes
  const recentReviews = cafes
    .flatMap(c => (c.recentReviews || []).map(r => ({ ...r, cafeName: c.name })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const bestCafeId = stats?.bestCafeId;

  const recentlyAddedCafes = [...cafes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="container fade-in" style={{ padding: "40px 0 80px 0" }}>

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex-between" style={{ flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
        <div>
          <h1 className="section-title">
            Admin <span className="text-accent">Dashboard</span>
          </h1>
          <p className="section-subtitle">
            System-wide platform overview, listings moderation, user counts, and customer reviews.
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "36px",
        }}>
          <StatCard
            icon="🏪"
            label="Total Cafés"
            value={stats.totalCafes}
            sub="Listed spots"
          />
          <StatCard
            icon="✍️"
            label="Total Reviews"
            value={stats.totalReviews}
            sub="Across all spots"
          />
          <StatCard
            icon="⭐"
            label="System Rating"
            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
            sub="Global average"
            accent="var(--accent-dim)"
          />
          <StatCard
            icon="👥"
            label="Total Users"
            value={stats.totalUsers}
            sub={`Exp: ${stats.visitorCount} | Own: ${stats.ownerCount} | Adm: ${stats.adminCount}`}
          />
        </div>
      )}

      {/* ── Tabs Selector ──────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid var(--glass-border)",
        marginBottom: "28px",
        paddingBottom: "8px"
      }}>
        <button
          onClick={() => setActiveTab("listings")}
          style={{
            background: activeTab === "listings" ? "var(--glass-border-strong)" : "transparent",
            color: activeTab === "listings" ? "var(--accent-light)" : "var(--text-secondary)",
            border: "1px solid " + (activeTab === "listings" ? "var(--glass-border)" : "transparent"),
            padding: "8px 16px",
            fontSize: "0.9rem",
            fontWeight: "600",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all var(--transition)"
          }}
        >
          🏪 Café Listings
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            background: activeTab === "users" ? "var(--glass-border-strong)" : "transparent",
            color: activeTab === "users" ? "var(--accent-light)" : "var(--text-secondary)",
            border: "1px solid " + (activeTab === "users" ? "var(--glass-border)" : "transparent"),
            padding: "8px 16px",
            fontSize: "0.9rem",
            fontWeight: "600",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all var(--transition)"
          }}
        >
          👥 User Database (RBAC)
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            background: activeTab === "analytics" ? "var(--glass-border-strong)" : "transparent",
            color: activeTab === "analytics" ? "var(--accent-light)" : "var(--text-secondary)",
            border: "1px solid " + (activeTab === "analytics" ? "var(--glass-border)" : "transparent"),
            padding: "8px 16px",
            fontSize: "0.9rem",
            fontWeight: "600",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all var(--transition)"
          }}
        >
          📊 Platform Analytics
        </button>
      </div>

      {/* ── Main Tab Contents ───────────────────────────────── */}
      {activeTab === "listings" ? (
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          {/* Left column — Café listings moderation cards */}
          <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column" }}>
            
            {/* Moderation Queue Center */}
            {recentlyAddedCafes.length > 0 && (
              <div className="glass" style={{ padding: "20px", marginBottom: "28px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⚡</span> Moderation Queue (Recently Added)
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  {recentlyAddedCafes.map(c => {
                    const cover = c.images?.[0] || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";
                    const creatorName = c.createdBy?.name || "Partner";
                    return (
                      <div key={c._id} className="glass-flat" style={{ padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                        <img src={cover} alt={c.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{c.name}</h4>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>By {creatorName}</span>
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <Link to={`/cafes/${c._id}`} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>👁</Link>
                          <button onClick={() => handleCafeDelete(c._id)} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: "0.72rem", borderColor: "rgba(224, 82, 82, 0.2)", color: "var(--error)" }}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>
                All System spots
              </h2>
              {cafes.length > 0 && (
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Click <strong style={{ color: "var(--accent-light)" }}>📊 Analytics</strong> to expand scores
                </span>
              )}
            </div>

            {cafes.length === 0 ? (
              <EmptyState
                icon="🏪"
                title="No café spots listed in system yet"
                description="Start listing coffee shops to populate the platform dashboard analytics."
                actionText="List a Café"
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--star-filled)", fontSize: "0.82rem", fontWeight: "700" }}>
                          ★ {rev.overallRating}
                        </span>
                        <button
                          onClick={() => handleReviewDelete(rev._id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            opacity: 0.6,
                            transition: "opacity 0.25s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                          title="Moderate / Delete Review"
                        >
                          🗑️
                        </button>
                      </div>
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
                💡 System Admin Tip
              </strong>
              As an administrator, you moderate all uploaded cafes, edit properties, or remove spots violating listing standards.
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: User management database table view */
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Registered Users</h2>
            
            {/* Search filter input */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--glass-md)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--glass-border)",
              padding: "6px 12px",
              minWidth: "240px"
            }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>🔍</span>
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  width: "100%"
                }}
              />
            </div>
          </div>

          {usersLoading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div className="themed-spinner-ring" style={{ margin: "0 auto 16px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading user database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon="💖"
              title="No users found"
              description="We couldn't find any users in the database matching your search terms."
              actionText="Reset search"
              onAction={() => setUserSearch("")}
            />
          ) : (
            /* Glass table wrapper */
            <div className="glass" style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--glass-border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--glass-border)" }}>
                    <th style={{ padding: "16px 20px", fontWeight: "700", color: "var(--text-primary)" }}>User</th>
                    <th style={{ padding: "16px 20px", fontWeight: "700", color: "var(--text-primary)" }}>Email</th>
                    <th style={{ padding: "16px 20px", fontWeight: "700", color: "var(--text-primary)" }}>Join Date</th>
                    <th style={{ padding: "16px 20px", fontWeight: "700", color: "var(--text-primary)" }}>Role (RBAC)</th>
                    <th style={{ padding: "16px 20px", fontWeight: "700", color: "var(--text-primary)", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "16px 20px", fontWeight: "700", color: "var(--text-primary)", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const avatarInitials = u.name ? u.name.charAt(0).toUpperCase() : "👤";
                    const isDeactivated = u.isActive === false;

                    return (
                      <tr
                        key={u._id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                          background: isDeactivated ? "rgba(224, 82, 82, 0.02)" : "none",
                          transition: "background 0.25s ease"
                        }}
                      >
                        {/* User Avatar + Name */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: isDeactivated ? "rgba(224, 82, 82, 0.2)" : "var(--glass-border-strong)",
                              border: "1px solid var(--glass-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              overflow: "hidden"
                            }}>
                              {u.profileImage ? (
                                <img src={u.profileImage} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                avatarInitials
                              )}
                            </div>
                            <span style={{ fontWeight: "600", color: isDeactivated ? "var(--text-muted)" : "var(--text-primary)" }}>
                              {u.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: "14px 20px", color: "var(--text-secondary)" }}>
                          {u.email}
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>

                        {/* Role selector dropdown */}
                        <td style={{ padding: "14px 20px" }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={isDeactivated}
                            style={{
                              background: "rgba(0,0,0,0.3)",
                              color: isDeactivated ? "var(--text-muted)" : "var(--accent-light)",
                              border: "1px solid var(--glass-border)",
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 8px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              outline: "none",
                              cursor: isDeactivated ? "not-allowed" : "pointer"
                            }}
                          >
                            <option value="visitor">Explorer (Visitor)</option>
                            <option value="owner">Owner (Partner)</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>

                        {/* Active/Deactivated Badge */}
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            background: isDeactivated ? "rgba(224, 82, 82, 0.15)" : "rgba(76, 175, 110, 0.15)",
                            border: isDeactivated ? "1px solid rgba(224, 82, 82, 0.3)" : "1px solid rgba(76, 175, 110, 0.3)",
                            color: isDeactivated ? "var(--error)" : "var(--success)"
                          }}>
                            {isDeactivated ? "Deactivated" : "Active"}
                          </span>
                        </td>

                        {/* Status Toggle Action Button */}
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => handleStatusToggle(u._id)}
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: "0.75rem",
                              padding: "4px 10px",
                              borderColor: isDeactivated ? "rgba(76, 175, 110, 0.3)" : "rgba(224, 82, 82, 0.3)",
                              color: isDeactivated ? "var(--success)" : "var(--error)"
                            }}
                          >
                            {isDeactivated ? "🔓 Reactivate" : "🔒 Deactivate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && stats && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            
            {/* ── Sign-ups over time sparkline ── */}
            <div className="glass" style={{ padding: "24px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: "16px" }}>
                📈 User Registrations (Last 10 Days)
              </h3>
              <SignupsBarChart trend={stats.signupsTrend} />
            </div>

            {/* ── User Role Stacked breakdown ratio ── */}
            <div className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: "16px" }}>
                  👥 User Base Ratio
                </h3>
                
                {/* Visual Ratio Stacked Bar */}
                <div style={{
                  height: "24px",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  display: "flex",
                  background: "var(--glass-md)",
                  border: "1px solid var(--glass-border)",
                  marginBottom: "20px"
                }}>
                  {stats.totalUsers > 0 ? (
                    <>
                      <div
                        style={{
                          width: `${(stats.visitorCount / stats.totalUsers) * 100}%`,
                          background: "linear-gradient(90deg, #6e8eff, #6e8effbb)",
                          height: "100%"
                        }}
                        title={`Explorers: ${stats.visitorCount}`}
                      />
                      <div
                        style={{
                          width: `${(stats.ownerCount / stats.totalUsers) * 100}%`,
                          background: "linear-gradient(90deg, var(--accent), var(--accent)bb)",
                          height: "100%"
                        }}
                        title={`Owners: ${stats.ownerCount}`}
                      />
                      <div
                        style={{
                          width: `${(stats.adminCount / stats.totalUsers) * 100}%`,
                          background: "linear-gradient(90deg, #4caf6e, #4caf6ebb)",
                          height: "100%"
                        }}
                        title={`Admins: ${stats.adminCount}`}
                      />
                    </>
                  ) : (
                    <div style={{ flex: 1, background: "var(--glass-md)" }} />
                  )}
                </div>

                {/* Legend list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="flex-between" style={{ fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#6e8eff" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Café Explorers (Visitors):</span>
                    </div>
                    <span style={{ fontWeight: "700" }}>{stats.visitorCount} ({stats.totalUsers > 0 ? Math.round((stats.visitorCount / stats.totalUsers) * 100) : 0}%)</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--accent)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Café Owners (Partners):</span>
                    </div>
                    <span style={{ fontWeight: "700" }}>{stats.ownerCount} ({stats.totalUsers > 0 ? Math.round((stats.ownerCount / stats.totalUsers) * 100) : 0}%)</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4caf6e" }} />
                      <span style={{ color: "var(--text-secondary)" }}>Administrators:</span>
                    </div>
                    <span style={{ fontWeight: "700" }}>{stats.adminCount} ({stats.totalUsers > 0 ? Math.round((stats.adminCount / stats.totalUsers) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>

              <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px", marginTop: "12px" }}>
                Total Accounts: <strong>{stats.totalUsers} registered</strong>
              </span>
            </div>

          </div>

          {/* ── Most Reviewed Spots list ── */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", marginBottom: "20px" }}>
              🏆 Most Reviewed Café Spots (Lookup aggregates)
            </h3>
            
            {(!stats.mostReviewed || stats.mostReviewed.length === 0) ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>
                No reviews recorded yet. Submit reviews on cafés to build the ranking chart.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {stats.mostReviewed.map((item, idx) => {
                  const maxReviews = Math.max(...stats.mostReviewed.map(mr => mr.count), 1);
                  const pct = (item.count / maxReviews) * 100;
                  return (
                    <div key={item._id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div className="flex-between" style={{ fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                          #{idx + 1} {item.name} <span style={{ color: "var(--text-muted)", fontWeight: "500", fontSize: "0.78rem" }}>({item.location})</span>
                        </span>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontSize: "0.78rem", color: "var(--star-filled)" }}>★ {item.averageRating?.toFixed(1) || "N/A"}</span>
                          <span style={{ fontWeight: "700", color: "var(--accent-light)" }}>{item.count} review{item.count !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      
                      {/* Bar graph line */}
                      <div style={{ height: "8px", borderRadius: "999px", background: "var(--glass-md)", overflow: "hidden", position: "relative" }}>
                        <div style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: "999px",
                          background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                          transition: "width 0.8s ease"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Inline responsive tweaks */}
      <style>{`
        @media (max-width: 768px) {
          .analytics-expand { grid-template-columns: 1fr !important; }
          .dashboard-reviews { display: none; }
        }
      `}</style>
    </div>
  );
}
