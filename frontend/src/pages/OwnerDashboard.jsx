import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { cafeService } from "../services/cafeService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Rating from "../components/Rating";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCafeDelete = async (cafeId) => {
    if (!window.confirm("Are you sure you want to delete this café spot? This will remove all associated reviews and ratings.")) return;
    try {
      const res = await cafeService.deleteCafe(cafeId);
      if (res.success) {
        // Refresh local dashboard state list
        setCafes((prev) => prev.filter((c) => c._id !== cafeId));
        // Recalculate stats locally
        setStats((prev) => {
          const remainingCafes = cafes.filter((c) => c._id !== cafeId);
          const totalCafes = remainingCafes.length;
          const totalReviews = remainingCafes.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
          const avgRating = totalCafes > 0 
            ? Math.round((remainingCafes.reduce((sum, c) => sum + (c.averageRating || 0), 0) / totalCafes) * 10) / 10
            : 0;
          return { totalCafes, totalReviews, averageRating: avgRating };
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete café.");
    }
  };

  if (loading) return <Loading message="Opening owner dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  // Flatten and sort recent reviews from all cafes
  const recentReviews = cafes
    .flatMap((c) => (c.recentReviews || []).map((r) => ({ ...r, cafeName: c.name })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="container fade-in" style={{ padding: "40px 0 64px 0" }}>
      {/* Title */}
      <div className="flex-between" style={{ flexWrap: "wrap", gap: "16px", marginBottom: "40px" }}>
        <div>
          <h1 className="section-title">Café Owner <span className="text-accent">Dashboard</span></h1>
          <p className="section-subtitle">Manage listings, view customer ratings, and track performance metrics.</p>
        </div>
        <Link to="/add-cafe" className="btn btn-primary">
          ➕ List a New Café
        </Link>
      </div>

      {/* Analytics Summary Row */}
      {stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginBottom: "48px"
        }}>
          <div className="glass" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>🏪</span>
            <span style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600", marginTop: "8px" }}>Total Cafés Listed</span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "700", marginTop: "4px" }}>{stats.totalCafes}</h2>
          </div>

          <div className="glass" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>✍️</span>
            <span style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600", marginTop: "8px" }}>Combined Reviews</span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "700", marginTop: "4px" }}>{stats.totalReviews}</h2>
          </div>

          <div className="glass" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2rem" }}>⭐</span>
            <span style={{ display: "block", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600", marginTop: "8px" }}>Aggregate Rating</span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "700", marginTop: "4px", color: "var(--accent-light)" }}>
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
            </h2>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* Left Column — Cafés management */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "28px" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>My Café Spots</h2>
          
          {cafes.length === 0 ? (
            <EmptyState
              icon="🏪"
              title="No café spots listed yet"
              description="Start listing your coffee shops to collect customer ratings, features tags, and reviews."
              actionText="List your first Cafe"
              onAction={() => navigate("/add-cafe")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {cafes.map((cafe) => {
                const coverImage = cafe.images?.length > 0 ? cafe.images[0] : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";
                return (
                  <div key={cafe._id} className="glass-flat flex-between fade-in" style={{ padding: "20px", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                      <img src={coverImage} alt={cafe.name} style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
                      <div>
                        <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: "600" }}>{cafe.name}</h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>📍 {cafe.location}</span>
                        <div style={{ marginTop: "4px" }}>
                          <Rating value={cafe.averageRating} count={cafe.reviewCount} showText={true} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <Link to={`/cafes/${cafe._id}`} className="btn btn-ghost btn-sm">
                        👁️ View Spot
                      </Link>
                      <button className="btn btn-ghost btn-sm" style={{ borderColor: "rgba(224, 82, 82, 0.2)", color: "var(--error)" }} onClick={() => handleCafeDelete(cafe._id)}>
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column — Recent Reviews feed */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "24px" }} className="dashboard-reviews">
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Recent Reviews</h2>
          
          <div className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {recentReviews.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                No reviews yet. Submissions will appear here when posted.
              </div>
            ) : (
              recentReviews.map((rev) => (
                <div key={rev._id} style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "16px" }}>
                  <div className="flex-between">
                    <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{rev.user?.name || "Anonymous"}</span>
                    <span style={{ color: "var(--star-filled)", fontSize: "0.82rem" }}>★ {rev.overallRating}</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-light)" }}>on {rev.cafeName}</span>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic", whiteSpace: "pre-line" }}>
                    "{rev.comment.slice(0, 100)}{rev.comment.length > 100 ? "..." : ""}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
