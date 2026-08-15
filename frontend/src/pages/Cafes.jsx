import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { cafeService } from "../services/cafeService";
import { favoriteService } from "../services/favoriteService";
import { useAuth } from "../context/AuthContext";
import CafeCard from "../components/CafeCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { CafeCardSkeleton } from "../components/Skeletons";

export default function Cafes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cafes, setCafes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Extract query filters from URL search params
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const price = searchParams.get("price") || "";
  const minRating = searchParams.get("minRating") || "";
  const vibe = searchParams.get("vibe") || "";
  const minVibeScore = searchParams.get("minVibeScore") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const currentFilters = { search, category, price, minRating, vibe, minVibeScore, sort, page };

  // Fetch favorites if user is authenticated
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    try {
      const data = await favoriteService.getFavorites();
      if (data.success) {
        setFavorites(data.favorites.map((fav) => fav.cafe?._id || fav.cafe));
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  }, [isAuthenticated]);

  // Fetch cafes matching current search params
  const fetchCafes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const apiParams = {
        page,
        limit: 9,
        sort,
      };

      if (search) apiParams.search = search;
      if (category) apiParams.category = category;
      if (price) apiParams.price = price;
      if (minRating) apiParams.minRating = minRating;
      if (vibe) apiParams.vibe = vibe;
      if (vibe && minVibeScore) apiParams.minVibeScore = minVibeScore;

      const data = await cafeService.getCafes(apiParams);
      if (data.success) {
        setCafes(data.cafes);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load cafes.");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category, price, minRating, vibe, minVibeScore]);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const updateFilters = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        params[key] = newFilters[key];
      }
    });
    // Reset to page 1 on filter changes unless page was explicitly changed
    if (newFilters.page === undefined) {
      params.page = "1";
    }
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    updateFilters({ ...currentFilters, search: val });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilters({ ...currentFilters, page: String(newPage) });
    }
  };

  const handleFavoriteToggle = async (cafeId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const isFav = favorites.includes(cafeId);
    try {
      if (isFav) {
        const data = await favoriteService.removeFavorite(cafeId);
        if (data.success) {
          setFavorites((prev) => prev.filter((id) => id !== cafeId));
        }
      } else {
        const data = await favoriteService.addFavorite(cafeId);
        if (data.success) {
          setFavorites((prev) => [...prev, cafeId]);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <div className="container fade-in" style={{ padding: "40px 0 64px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>Explore All <span className="text-accent">Cafés</span></h1>
          <p className="section-subtitle" style={{ margin: "4px 0 0" }}>Find your perfect spot based on custom features and rating profiles</p>
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (category) params.set("category", category);
            navigate(`/map?${params.toString()}`);
          }}
          className="btn btn-ghost btn-sm"
          style={{
            borderColor: "var(--glass-border-strong)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "700",
            letterSpacing: "0.03em",
          }}
        >
          🗺 Map View
        </button>
      </div>

      {/* Sticky Horizontal Filter Bar */}
      <div className="glass sticky-filter-bar" style={{
        position: "sticky",
        top: "calc(var(--navbar-h) + 12px)",
        zIndex: 90,
        padding: "12px 18px",
        marginBottom: "36px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        borderRadius: "var(--radius-lg)",
        background: "var(--glass-hover)",
        backdropFilter: "var(--blur-md)",
        border: "1px solid var(--glass-border-strong)",
        boxShadow: "var(--shadow-md)"
      }}>
        {/* Search field */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 200px", minWidth: "180px", background: "rgba(0,0,0,0.25)", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", padding: "6px 12px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search cafés, locations, vibes..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
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

        {/* Category Vibe selector */}
        <select
          value={category}
          onChange={(e) => updateFilters({ ...currentFilters, category: e.target.value })}
          className="filter-select"
        >
          <option value="">🔮 All Vibes</option>
          <option value="Coffee">☕ Coffee</option>
          <option value="Study">📚 Study</option>
          <option value="Work">💻 Work</option>
          <option value="Date">❤️ Date</option>
          <option value="Chill">🌙 Chill</option>
          <option value="Budget">💰 Budget</option>
        </select>

        {/* Price selector */}
        <select
          value={price}
          onChange={(e) => updateFilters({ ...currentFilters, price: e.target.value })}
          className="filter-select"
        >
          <option value="">💰 Any Price</option>
          <option value="$">₹ (Budget)</option>
          <option value="$$">₹₹ (Mid-range)</option>
          <option value="$$$">₹₹₹ (Premium)</option>
        </select>

        {/* Rating selector */}
        <select
          value={minRating}
          onChange={(e) => updateFilters({ ...currentFilters, minRating: e.target.value })}
          className="filter-select"
        >
          <option value="">⭐ Any Rating</option>
          <option value="3">⭐ 3.0+</option>
          <option value="4">⭐ 4.0+</option>
          <option value="4.5">⭐ 4.5+</option>
        </select>

        {/* Sort selector */}
        <select
          value={sort}
          onChange={(e) => updateFilters({ ...currentFilters, sort: e.target.value })}
          className="filter-select"
          style={{ marginLeft: "auto" }}
        >
          <option value="newest">📅 Newest Spots</option>
          <option value="rating">🏆 Highest Rated</option>
          <option value="popular">🔥 Most Popular</option>
        </select>

        {/* Reset filter button */}
        {(search || category || price || minRating) && (
          <button
            onClick={handleClearFilters}
            className="btn btn-ghost btn-sm"
            style={{
              padding: "8px 14px",
              fontSize: "0.8rem",
              borderRadius: "var(--radius-sm)",
              borderColor: "rgba(224, 82, 82, 0.3)",
              color: "var(--error)"
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Grid View */}
      <main style={{ width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
        {loading ? (
          <div className="cafe-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <CafeCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCafes} />
        ) : cafes.length === 0 ? (
          <EmptyState
            title="No Cafés Found"
            description="We couldn't find any cafés matching your search terms or filters. Try clearing your filters or testing other terms."
            actionText="Reset All Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <>
            {/* Metadata count */}
            <div className="flex-between text-secondary" style={{ fontSize: "0.85rem", marginTop: "-16px" }}>
              <span>Found {total} {total === 1 ? "café" : "cafés"}</span>
              <span>Page {page} of {totalPages}</span>
            </div>

            {/* Grid */}
            <div className="cafe-grid">
              {cafes.map((cafe) => (
                <CafeCard
                  key={cafe._id}
                  cafe={cafe}
                  isFavorited={favorites.includes(cafe._id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex-center mt-4" style={{ gap: "16px" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ◀ Prev
                </button>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
