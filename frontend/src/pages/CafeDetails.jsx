import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { cafeService } from "../services/cafeService";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Rating from "../components/Rating";
import VibeScore from "../components/VibeScore";
import ReviewCard from "../components/ReviewCard";
import CafeCard from "../components/CafeCard";
import { CafeDetailsSkeleton, ReviewCardSkeleton, CafeCardSkeleton } from "../components/Skeletons";
import ImageGallery from "../components/ImageGallery";

function RatingSelector({ label, value, onChange }) {
  return (
    <div className="flex-between" style={{ padding: "6px 0" }}>
      <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "var(--text-secondary)" }}>{label}</span>
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              color: star <= value ? "var(--star-filled)" : "var(--star-empty)",
              cursor: "pointer",
              transition: "transform 0.1s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CafeDetails() {
  const { id: cafeId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [cafe, setCafe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const [similarCafes, setSimilarCafes] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  // Review form states
  const [comment, setComment] = useState("");
  const [coffeeRating, setCoffeeRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [ambienceRating, setAmbienceRating] = useState(5);
  const [wifiRating, setWifiRating] = useState(5);
  const [quietnessRating, setQuietnessRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [reviewImage, setReviewImage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingReviewId, setEditingReviewId] = useState(null);

  const fetchCafeDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cafeService.getCafeById(cafeId);
      if (data.success) {
        setCafe(data.cafe);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load cafe details.");
    } finally {
      setLoading(false);
    }
  }, [cafeId]);

  const fetchCafeReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const data = await cafeService.getCafeReviews(cafeId);
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [cafeId]);

  const fetchSimilarCafes = useCallback(async () => {
    try {
      setSimilarLoading(true);
      const data = await cafeService.getSimilarCafes(cafeId, 4);
      if (data.success) {
        setSimilarCafes(data.cafes);
      }
    } catch (err) {
      console.error("Failed to load similar cafes:", err);
    } finally {
      setSimilarLoading(false);
    }
  }, [cafeId]);

  useEffect(() => {
    fetchCafeDetails();
    fetchCafeReviews();
    fetchSimilarCafes();
  }, [fetchCafeDetails, fetchCafeReviews, fetchSimilarCafes]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!comment.trim()) {
      setSubmitError("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const reviewPayload = {
        coffeeRating,
        foodRating,
        ambienceRating,
        wifiRating,
        quietnessRating,
        valueRating,
        comment,
        image: reviewImage,
      };

      if (editingReviewId) {
        // Edit existing review
        const res = await cafeService.updateCafeReview(editingReviewId, reviewPayload);
        if (res.success) {
          setEditingReviewId(null);
          resetReviewForm();
          fetchCafeDetails(); // Refresh cafe score average
          fetchCafeReviews(); // Refresh reviews list
        }
      } else {
        // Add new review
        const res = await cafeService.addReview(cafeId, reviewPayload);
        if (res.success) {
          resetReviewForm();
          fetchCafeDetails();
          fetchCafeReviews();
        }
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInit = (review) => {
    setEditingReviewId(review._id);
    setComment(review.comment);
    setCoffeeRating(review.coffeeRating);
    setFoodRating(review.foodRating);
    setAmbienceRating(review.ambienceRating);
    setWifiRating(review.wifiRating);
    setQuietnessRating(review.quietnessRating);
    setValueRating(review.valueRating);
    setReviewImage(review.image || "");
    // Scroll to form
    const formElem = document.getElementById("review-form-anchor");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await cafeService.deleteCafeReview(reviewId);
      if (res.success) {
        fetchCafeDetails();
        fetchCafeReviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete review.");
    }
  };

  const resetReviewForm = () => {
    setComment("");
    setCoffeeRating(5);
    setFoodRating(5);
    setAmbienceRating(5);
    setWifiRating(5);
    setQuietnessRating(5);
    setValueRating(5);
    setReviewImage("");
    setEditingReviewId(null);
  };

  if (loading) return <CafeDetailsSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCafeDetails} />;
  if (!cafe) return <ErrorMessage message="Cafe not found." />;

  const coverImage = cafe.images?.length > 0
    ? cafe.images[0]
    : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";

  const defaultOpeningHours = [
    { day: "Mon - Fri", open: "08:00", close: "22:00" },
    { day: "Sat - Sun", open: "09:00", close: "23:00" }
  ];
  const hoursToDisplay = cafe.openingHours?.length > 0 ? cafe.openingHours : defaultOpeningHours;

  const userExistingReview = reviews.find((rev) => rev.user?._id === user?._id);

  const getHighlights = (ratings = {}) => {
    const highlights = [];
    if (!ratings) return highlights;
    
    if (ratings.wifi >= 4 && ratings.quietness >= 4) {
      highlights.push({
        icon: "📚",
        title: "Great for studying",
        desc: "Quiet environment + strong Wi-Fi connection"
      });
    } else if (ratings.wifi >= 4.2) {
      highlights.push({
        icon: "💻",
        title: "Excellent for working",
        desc: "High-speed Wi-Fi and reliable workspace"
      });
    }
    
    if (ratings.coffee >= 4.3) {
      highlights.push({
        icon: "☕",
        title: "Coffee is the highlight",
        desc: `${ratings.coffee.toFixed(1)}/5 rating from visitors`
      });
    }
    
    if (ratings.ambience >= 4.3) {
      highlights.push({
        icon: "✨",
        title: "Beautiful Ambiance",
        desc: "Highly rated for its cozy and welcoming atmosphere"
      });
    }
    
    if (ratings.value >= 4.3) {
      highlights.push({
        icon: "💰",
        title: "Excellent Value",
        desc: "Great quality coffee and food at a very fair price"
      });
    }

    if (ratings.food >= 4.3) {
      highlights.push({
        icon: "🍕",
        title: "Delicious Food Options",
        desc: "Highly recommended for snacks and eats"
      });
    }

    // Fallback if no highlights found but reviews exist
    if (highlights.length === 0 && Object.keys(ratings).length > 0 && cafe.reviewCount > 0) {
      const sorted = Object.entries(ratings)
        .filter(([_, val]) => val > 0)
        .sort((a, b) => b[1] - a[1]);
      
      if (sorted.length > 0) {
        const [topKey, topVal] = sorted[0];
        const labelMap = {
          coffee: { icon: "☕", title: "Top-tier Coffee", desc: "Our highest rated aspect by visitors" },
          food: { icon: "🍕", title: "Good Food", desc: "Highly rated selection of snacks and dishes" },
          ambience: { icon: "✨", title: "Pleasant Ambiance", desc: "Enjoyable seating area and environment" },
          wifi: { icon: "📶", title: "Decent Wi-Fi", desc: "Reliable connectivity for browse & chat" },
          quietness: { icon: "🤫", title: "Quiet & Calm", desc: "Good spot to escape the noise" },
          value: { icon: "💎", title: "Fair Pricing", desc: "Good balance of price and quality" }
        };
        const item = labelMap[topKey];
        if (item) {
          highlights.push({
            icon: item.icon,
            title: item.title,
            desc: `${topVal.toFixed(1)}/5 average score`
          });
        }
      }
    }

    return highlights;
  };

  const highlights = getHighlights(cafe?.ratings);

  return (
    <div className="container fade-in" style={{ padding: "40px 0 64px 0" }}>
      {/* Back Link */}
      <Link to="/cafes" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--accent-light)", marginBottom: "20px" }}>
        ← Back to all Cafés
      </Link>

      {/* Main Grid */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* Left Column — Images, Info, Vibe Scores */}
        <div style={{ flex: "1 1 360px", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "28px" }} className="details-sidebar">
          {/* Large Cafe Card Image Gallery */}
          <ImageGallery images={cafe.images} category={cafe.category} />

          {/* Vibe Score summary card */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: "16px" }}>Vibe Scores</h3>
            <VibeScore vibes={cafe.vibes} />
          </div>

          {/* Features tag cloud */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: "12px" }}>Available Features</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {cafe.features?.length > 0 ? (
                cafe.features.map((feat) => (
                  <span key={feat} className="badge badge-glass">{feat}</span>
                ))
              ) : (
                <span className="text-secondary" style={{ fontSize: "0.85rem" }}>No feature tags listed.</span>
              )}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="glass" style={{ padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: "12px" }}>Opening Hours</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {hoursToDisplay.map((h) => (
                <div key={h.day} className="flex-between" style={{ fontSize: "0.88rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{h.day}:</span>
                  <span style={{ fontWeight: "600" }}>{h.isClosed ? "Closed" : `${h.open} - ${h.close}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Details & Review board */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Header Metadata block */}
          <div className="glass" style={{ padding: "32px" }}>
            <div className="flex-between" style={{ flexWrap: "wrap", gap: "12px" }}>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: "700" }}>{cafe.name}</h1>
              <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: 0 }}>{cafe.priceRange}</span>
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "0.95rem" }}>
              📍 {cafe.location} • {cafe.address}
            </p>

            <div className="divider" />

            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600", letterSpacing: "0.04em" }}>Average Rating</span>
                <Rating value={cafe.averageRating} count={cafe.reviewCount} showText={true} />
              </div>
            </div>

            <div className="divider" />

            <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", whiteSpace: "pre-line" }}>
              {cafe.description}
            </p>

            {highlights.length > 0 && (
              <>
                <div className="divider" />
                <div style={{ marginTop: "24px" }}>
                  <h3 style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    marginBottom: "16px"
                  }}>
                    ✨ Why people love this spot
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                    {highlights.map((h, index) => (
                      <div key={index} style={{
                        display: "flex",
                        gap: "12px",
                        padding: "14px 18px",
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "var(--radius-md)",
                        transition: "all var(--transition)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--glass-border)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      >
                        <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{h.icon}</span>
                        <div>
                          <h4 style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 4px" }}>
                            {h.title}
                          </h4>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                            {h.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Review List block */}
          <div className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>Community Reviews</h2>

            {reviewsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {reviews.map((rev) => (
                  <ReviewCard
                    key={rev._id}
                    review={rev}
                    currentUserId={user?._id}
                    isAdmin={user?.role === "admin"}
                    onEdit={() => handleEditInit(rev)}
                    onDelete={() => handleDeleteReview(rev._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Write a Review block */}
          <div id="review-form-anchor" className="glass" style={{ padding: "32px" }}>
            {isAuthenticated ? (
              userExistingReview && !editingReviewId ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: "8px" }}>Your review has been submitted</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "16px" }}>
                    You have already written a review for this café spot. You can edit or delete it in the reviews list above.
                  </p>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEditInit(userExistingReview)}>
                    ✏️ Edit Your Review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem" }}>
                    {editingReviewId ? "Edit Your Review" : "Write a Review"}
                  </h3>

                  {submitError && (
                    <div className="badge badge-error" style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", textTransform: "none", width: "100%", textAlign: "center", display: "block" }}>
                      {submitError}
                    </div>
                  )}

                  {/* Rating Selector Matrix */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    background: "rgba(255,255,255,0.02)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--glass-border)"
                  }}>
                    <RatingSelector label="☕ Coffee Quality" value={coffeeRating} onChange={setCoffeeRating} />
                    <RatingSelector label="🍔 Food Quality" value={foodRating} onChange={setFoodRating} />
                    <RatingSelector label="✨ Ambiance" value={ambienceRating} onChange={setAmbienceRating} />
                    <RatingSelector label="📶 Wi-Fi Access" value={wifiRating} onChange={setWifiRating} />
                    <RatingSelector label="🤫 Quietness" value={quietnessRating} onChange={setQuietnessRating} />
                    <RatingSelector label="💰 Value for Money" value={valueRating} onChange={setValueRating} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Review Comment</label>
                    <textarea
                      rows="4"
                      className="form-input"
                      required
                      placeholder="Share your thoughts about this spot's vibes, quietness, and service..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image URL (Optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={reviewImage}
                      onChange={(e) => setReviewImage(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    {editingReviewId && (
                      <button type="button" className="btn btn-ghost" onClick={resetReviewForm}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Submitting..." : editingReviewId ? "Save Changes" : "Post Review"}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", marginBottom: "8px" }}>Write a Review</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "16px" }}>
                  Please log in or register to submit rating metrics, scores, and comments for this café spot.
                </p>
                <button className="btn btn-primary" onClick={() => navigate("/login")}>
                  Log In to Review
                </button>
              </div>
            )}
          </div>

          {/* Similar Cafes — vibe-score based recommendations */}
          {(similarLoading || similarCafes.length > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>
                You Might Also <span className="text-accent">Like</span>
              </h2>
              {similarLoading ? (
                <div className="cafe-grid">
                  <CafeCardSkeleton />
                  <CafeCardSkeleton />
                  <CafeCardSkeleton />
                </div>
              ) : (
                <div className="cafe-grid">
                  {similarCafes.map((sc) => (
                    <div key={sc._id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <CafeCard cafe={sc} />
                      {typeof sc.similarityScore === "number" && (
                        <span style={{ fontSize: "0.8rem", color: "var(--accent-light)", fontWeight: "600", textAlign: "center" }}>
                          {sc.similarityScore}% vibe match
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 950px) {
          .details-sidebar { max-width: 100% !important; width: 100% !important; flex: 1 1 100% !important; }
        }
      `}</style>
    </div>
  );
}
