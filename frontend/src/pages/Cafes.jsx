import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cafeService } from "../services/cafeService";
import { favoriteService } from "../services/favoriteService";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import CafeCard from "../components/CafeCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

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
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const currentFilters = { search, category, price, minRating, sort, page };

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
  }, [page, sort, search, category, price, minRating]);

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

  const handleFilterPanelChange = (updatedFilters) => {
    updateFilters({
      ...currentFilters,
      ...updatedFilters,
    });
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
      <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h1 className="section-title">Explore All <span className="text-accent">Cafés</span></h1>
        <div style={{ maxWidth: "700px" }}>
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Search cafe by name, city, vibe tags..." />
        </div>
      </div>

      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
        {/* Filter Panel - Sidebar */}
        <aside style={{ flex: "1 1 280px", maxWidth: "340px" }} className="aside-filters">
          <FilterPanel
            filters={currentFilters}
            onChange={handleFilterPanelChange}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Cafe Cards Feed */}
        <main style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {loading ? (
            <Loading />
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
              {/* Count & Pagination Top Bar */}
              <div className="flex-between text-secondary" style={{ fontSize: "0.9rem" }}>
                <span>Found {total} {total === 1 ? "cafe" : "cafes"}</span>
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

              {/* Pagination controls */}
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

      <style>{`
        @media (max-width: 950px) {
          .aside-filters { max-width: 100% !important; width: 100% !important; flex: 1 1 100% !important; }
        }
      `}</style>
    </div>
  );
}
