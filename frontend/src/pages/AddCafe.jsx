import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cafeService } from "../services/cafeService";
import { uploadService } from "../services/uploadService";

const MAX_IMAGES = 6;

export default function AddCafe() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [priceRange, setPriceRange] = useState("$$");
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState([]); // uploaded Cloudinary URLs
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError("");

    if (images.length + files.length > MAX_IMAGES) {
      setUploadError(`You can upload up to ${MAX_IMAGES} photos total.`);
      e.target.value = "";
      return;
    }

    setUploadingImages(true);
    try {
      const res = await uploadService.uploadCafeImages(files);
      if (res.success) {
        setImages((prev) => [...prev, ...res.urls]);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || "Failed to upload image(s).");
    } finally {
      setUploadingImages(false);
      e.target.value = ""; // allow re-selecting the same file later
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !description.trim() || !location.trim() || !address.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Parse comma-separated features
      const features = featureInput
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f !== "");

      const payload = {
        name,
        description,
        location,
        address,
        category,
        priceRange,
        features,
        images,
        openingHours: [
          { day: "Mon - Fri", open: "08:00", close: "22:00", isClosed: false },
          { day: "Sat - Sun", open: "09:00", close: "23:00", isClosed: false },
        ]
      };

      const res = await cafeService.createCafe(payload);
      if (res.success) {
        setSuccess("Cafe created successfully!");
        setTimeout(() => {
          navigate(`/cafes/${res.cafe._id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create cafe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container fade-in" style={{ padding: "40px 0 64px 0" }}>
      <div className="glass-md" style={{ padding: "40px", maxWidth: "680px", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "8px" }}>
          Submit a New Café <span className="text-accent">Spot</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
          Share your favorite coffee shop or study space with the community.
        </p>

        {error && (
          <div className="badge badge-error mb-4" style={{ padding: "10px 14px", textTransform: "none", width: "100%", textAlign: "center", display: "block" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="badge badge-success mb-4" style={{ padding: "10px 14px", textTransform: "none", width: "100%", textAlign: "center", display: "block" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="form-group">
            <label className="form-label">Café Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Brew Theory"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              rows="4"
              className="form-input"
              required
              placeholder="Tell us about the vibe, study tables, seating, lighting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">City / Location *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Bangalore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Range *</label>
              <select
                className="form-input"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="$">$ (Affordable)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Premium)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category / Vibe *</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Coffee">Coffee (Quality Beans)</option>
              <option value="Study">Study (Quiet & Reading)</option>
              <option value="Work">Work (Power & WiFi)</option>
              <option value="Date">Date (Romantic Atmosphere)</option>
              <option value="Chill">Chill (Lounge & Chat)</option>
              <option value="Budget">Budget (Low Cost Good Vibe)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Address *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. 12, Lavelle Road, Bangalore - 560001"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Features / Amenities (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wi-Fi, Power Outlets, Outdoor Seating, Quiet Zone"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Café Photos (up to {MAX_IMAGES})</label>

            {images.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                gap: "10px",
                marginBottom: "4px"
              }}>
                {images.map((url, i) => (
                  <div key={url} style={{ position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", aspectRatio: "1 / 1" }}>
                    <img src={url} alt={`Upload ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      aria-label="Remove photo"
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(10, 10, 12, 0.75)",
                        border: "1px solid var(--glass-border-strong)",
                        color: "var(--text-primary)",
                        fontSize: "0.75rem",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <label
                className="btn btn-ghost btn-sm"
                style={{ width: "fit-content", cursor: uploadingImages ? "not-allowed" : "pointer", opacity: uploadingImages ? 0.6 : 1 }}
              >
                {uploadingImages ? "Uploading…" : "+ Upload Photos"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploadingImages}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {uploadError && (
              <span style={{ fontSize: "0.8rem", color: "var(--error)" }}>{uploadError}</span>
            )}
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              JPG, PNG, or WEBP — up to 5MB each. First photo becomes the cover image.
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/cafes")}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || uploadingImages}>
              {submitting ? "Submitting Spot..." : "Submit Cafe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
