import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { favoriteService } from "../services/favoriteService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import CafeCard from "../components/CafeCard";
import ReviewCard from "../components/ReviewCard";
import EmptyState from "../components/EmptyState";

export default function Profile() {
  const { user: authUser, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile"); // profile | cafes | reviews | favorites
  const [profileLoading, setProfileLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");

  // Data lists
  const [myCafes, setMyCafes] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);

  // Edit Profile form states
  const [name, setName] = useState(authUser?.name || "");
  const [profileImage, setProfileImage] = useState(authUser?.profileImage || "");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchProfileData = async () => {
    try {
      setDataLoading(true);
      setError("");

      const [cafesRes, reviewsRes, favsRes] = await Promise.all([
        userService.getMyCafes(),
        userService.getMyReviews(),
        userService.getMyFavorites(),
      ]);

      if (cafesRes.success) setMyCafes(cafesRes.cafes);
      if (reviewsRes.success) setMyReviews(reviewsRes.reviews);
      if (favsRes.success) setMyFavorites(favsRes.favorites);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load profile data.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");
    setUpdating(true);

    try {
      const data = await userService.updateProfile({ name, profileImage });
      if (data.success) {
        setUpdateSuccess("Profile updated successfully!");
        // Update User object inside AuthContext state and localStorage
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleFavoriteToggle = async (cafeId) => {
    try {
      const res = await favoriteService.removeFavorite(cafeId);
      if (res.success) {
        setMyFavorites((prev) => prev.filter((fav) => {
          const id = fav.cafe?._id || fav.cafe;
          return id !== cafeId;
        }));
      }
    } catch (err) {
      console.error("Failed to untoggle favorite:", err);
    }
  };

  const tabs = [
    { id: "profile", label: "👤 Profile Settings" },
    { id: "cafes", label: "☕ My Submitted Cafés" },
    { id: "reviews", label: "✍️ My Reviews" },
    { id: "favorites", label: "💖 My Favorites" },
  ];

  return (
    <div className="container fade-in" style={{ padding: "40px 0 64px 0" }}>
      {/* Header Profile Summary */}
      <div className="glass-md" style={{
        padding: "32px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
        marginBottom: "40px"
      }}>
        <div style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: "var(--glass-border-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
          overflow: "hidden",
          border: "2px solid var(--accent)"
        }}>
          {authUser?.profileImage ? (
            <img src={authUser.profileImage} alt={authUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            authUser?.name?.charAt(0).toUpperCase() || "👤"
          )}
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem" }}>{authUser?.name}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{authUser?.email}</p>
          <span className="badge badge-accent" style={{ marginTop: "8px" }}>
            {authUser?.role || "user"} role
          </span>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--glass-border)",
        gap: "8px",
        marginBottom: "32px",
        overflowX: "auto",
        paddingBottom: "4px"
      }}>
        {tabs.map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-ghost"}`}
              style={{
                borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                borderBottom: isSelected ? "none" : "1px solid var(--glass-border)",
                whiteSpace: "nowrap"
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "profile" && (
          <div className="glass" style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", marginBottom: "24px" }}>Edit Profile</h2>

            {updateError && (
              <div className="badge badge-error mb-4" style={{ padding: "10px 14px", textTransform: "none", width: "100%", textAlign: "center", display: "block" }}>
                {updateError}
              </div>
            )}
            {updateSuccess && (
              <div className="badge badge-success mb-4" style={{ padding: "10px 14px", textTransform: "none", width: "100%", textAlign: "center", display: "block" }}>
                {updateSuccess}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input"
                  disabled
                  value={authUser?.email || ""}
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role (Read-only)</label>
                <input
                  type="text"
                  className="form-input"
                  disabled
                  value={authUser?.role || "user"}
                  style={{ opacity: 0.5, cursor: "not-allowed", textTransform: "capitalize" }}
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4" disabled={updating}>
                {updating ? "Saving Changes..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}

        {dataLoading ? (
          <Loading message="Fetching details..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProfileData} />
        ) : (
          <>
            {activeTab === "cafes" && (
              <div>
                {myCafes.length === 0 ? (
                  <EmptyState
                    icon="☕"
                    title="No cafes submitted yet"
                    description="You haven't submitted any cafes to our listings yet. Share a local spot with the community!"
                    actionText="Submit Café Spot"
                    onAction={() => window.location.href = "/add-cafe"}
                  />
                ) : (
                  <div className="cafe-grid">
                    {myCafes.map((cafe) => (
                      <CafeCard key={cafe._id} cafe={cafe} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
                {myReviews.length === 0 ? (
                  <EmptyState
                    icon="✍️"
                    title="No reviews posted yet"
                    description="Write your first review on any cafe's details page to rate coffee, vibes, and values."
                    actionText="Browse Spots"
                    onAction={() => window.location.href = "/cafes"}
                  />
                ) : (
                  myReviews.map((rev) => (
                    <div key={rev._id} className="glass-flat" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="flex-between">
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--accent-light)" }}>
                            {rev.cafe?.name || "Deleted Café"}
                          </h4>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                            reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ color: "var(--star-filled)", fontWeight: "bold" }}>★ {rev.overallRating}</span>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div>
                {myFavorites.length === 0 ? (
                  <EmptyState
                    icon="💖"
                    title="No saved spots"
                    description="Find a café you'll love and click the heart icon to save it for quick access."
                    actionText="Search Cafés"
                    onAction={() => window.location.href = "/cafes"}
                  />
                ) : (
                  <div className="cafe-grid">
                    {myFavorites.map((fav) => {
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
