import React, { useState, useEffect } from "react";
import { favoriteService } from "../services/favoriteService";
import CafeCard from "../components/CafeCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await favoriteService.getFavorites();
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (cafeId) => {
    try {
      const data = await favoriteService.removeFavorite(cafeId);
      if (data.success) {
        // Remove from local list state directly
        setFavorites((prev) => prev.filter((fav) => {
          const id = fav.cafe?._id || fav.cafe;
          return id !== cafeId;
        }));
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (loading) return <Loading message="Opening your saved spots..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchFavorites} />;

  return (
    <div className="container fade-in" style={{ padding: "40px 0 64px 0" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 className="section-title">Your Favorite <span className="text-accent">Spots</span></h1>
        <p className="section-subtitle">A collection of your saved cafés and workspace vibes.</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon="💖"
          title="No saved spots yet."
          description="Find a café you'll love and click the heart icon to save it here for quick access."
          actionText="Discover Cafés"
          onAction={() => window.location.href = "/cafes"}
        />
      ) : (
        <div className="cafe-grid">
          {favorites.map((fav) => {
            const cafeObj = fav.cafe;
            if (!cafeObj) return null;
            return (
              <CafeCard
                key={cafeObj._id}
                cafe={cafeObj}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
