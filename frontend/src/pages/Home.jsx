import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cafeService } from "../services/cafeService";
import SearchBar from "../components/SearchBar";
import CafeCard from "../components/CafeCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Home() {
  const navigate = useNavigate();
  const [topCafes, setTopCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchVal, setSearchVal] = useState("");

  const categories = [
    { name: "Coffee", icon: "☕", desc: "For caffeine lovers" },
    { name: "Study", icon: "📚", desc: "For quiet study sessions" },
    { name: "Work", icon: "💻", desc: "With sockets and fast WiFi" },
    { name: "Date", icon: "❤️", desc: "Cozy and romantic ambiance" },
    { name: "Chill", icon: "🌙", desc: "To unwind and relax" },
    { name: "Budget", icon: "💰", desc: "Great value for money" },
  ];

  // Mock static latest reviews with gorgeous styling since we don't have a global latest-reviews API endpoint
  const latestReviews = [
    {
      _id: "review-1",
      user: { name: "Ananya R.", profileImage: "" },
      cafe: { name: "Brew Theory" },
      comment: "Absolutely loved the quiet zone! It's so easy to focus here, and their single-origin espresso is to die for.",
      overallRating: 4.8,
      createdAt: new Date().toISOString()
    },
    {
      _id: "review-2",
      user: { name: "Rahul S.", profileImage: "" },
      cafe: { name: "The Bean House" },
      comment: "Super friendly staff and very cozy. The outdoor seating is pet-friendly which is a huge plus for us!",
      overallRating: 4.5,
      createdAt: new Date().toISOString()
    },
    {
      _id: "review-3",
      user: { name: "Vikram K.", profileImage: "" },
      cafe: { name: "Roastery Republic" },
      comment: "A bit premium, but the coffee tasting flight is worth every single penny. Best coffee in town.",
      overallRating: 5.0,
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    const fetchTopCafes = async () => {
      try {
        setLoading(true);
        const data = await cafeService.getCafes({ sort: "rating", limit: 3 });
        if (data.success) {
          setTopCafes(data.cafes);
        }
      } catch (err) {
        setError(err.message || "Failed to load top rated cafes.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopCafes();
  }, []);

  const handleSearchSubmit = (searchTerm) => {
    const term = typeof searchTerm === "string" ? searchTerm : searchVal;
    if (term.trim()) {
      navigate(`/cafes?search=${encodeURIComponent(term)}`);
    }
  };

  const handleCategoryClick = (catName) => {
    navigate(`/cafes?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "64px", paddingBottom: "64px" }}>
      {/* Hero Section */}
      <section style={{
        position: "relative",
        height: "75vh",
        minHeight: "500px",
        background: "linear-gradient(rgba(10,10,12,0.8), rgba(10,10,12,0.9)), url('https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1600') center/cover no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px"
      }}>
        <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "var(--text-primary)"
          }}>
            FIND YOUR <span className="text-accent">PERFECT SPOT.</span>
          </h1>
          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "var(--text-secondary)",
            maxWidth: "600px"
          }}>
            Discover and book local cafés based on your specific vibe: work, study, romantic dates, or a budget chill.
          </p>

          <div style={{ width: "100%", maxWidth: "600px", marginTop: "16px" }}>
            <SearchBar 
              value={searchVal} 
              onChange={setSearchVal} 
              onSearch={handleSearchSubmit} 
              placeholder="Search cafe name, location, keyword..." 
            />
          </div>


          <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              to="/cafes"
              className="btn btn-primary"
              style={{ fontSize: "0.9rem", padding: "11px 28px", fontWeight: "700" }}
            >
              ☕ Explore Cafés
            </Link>
            <Link
              to="/map"
              className="btn btn-ghost"
              style={{
                fontSize: "0.9rem", padding: "11px 28px", fontWeight: "700",
                borderColor: "var(--glass-border-strong)",
              }}
            >
              🗺 View on Map
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Vibe Section */}
      <section className="container">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 className="section-title">Discover Cafés By <span className="text-accent">Vibe</span></h2>
          <p className="section-subtitle">What's your mood today? Pick a style and start exploring.</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "20px"
        }}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="glass"
              onClick={() => handleCategoryClick(cat.name)}
              style={{
                padding: "32px 20px",
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                transition: "all var(--transition)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "var(--shadow-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>{cat.icon}</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>{cat.name}</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Rated Section */}
      <section className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Top Rated <span className="text-accent">Spots</span></h2>
            <p className="section-subtitle">Highly recommended based on user ratings</p>
          </div>
          <Link to="/cafes?sort=rating" className="btn btn-ghost btn-sm text-accent">
            View All
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="cafe-grid">
            {topCafes.map((cafe) => (
              <CafeCard key={cafe._id} cafe={cafe} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Reviews Section */}
      <section className="container">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 className="section-title">Latest <span className="text-accent">Reviews</span></h2>
          <p className="section-subtitle">What the community is saying about their favorite spots</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px"
        }}>
          {latestReviews.map((rev) => (
            <div key={rev._id} className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="flex-between">
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>{rev.user.name}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>on {rev.cafe.name}</span>
                </div>
                <span style={{ color: "var(--star-filled)", fontWeight: "bold" }}>★ {rev.overallRating}</span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
