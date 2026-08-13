import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Cafes from "./pages/Cafes";
import CafeDetails from "./pages/CafeDetails";
import AddCafe from "./pages/AddCafe";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerDashboard from "./pages/OwnerDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";

// ── Protected Route Helper ───────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--bg)" }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div className="page-content" style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cafes" element={<Cafes />} />
          <Route path="/cafes/:id" element={<CafeDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/add-cafe" element={
            <ProtectedRoute allowedRoles={["owner", "admin"]}>
              <AddCafe />
            </ProtectedRoute>
          } />
          <Route path="/owner-dashboard" element={
            <ProtectedRoute allowedRoles={["owner", "admin"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
