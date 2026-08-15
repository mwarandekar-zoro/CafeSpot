import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AdminDashboard from "./pages/AdminDashboard";
import MapView from "./pages/MapView";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackgroundBlobs from "./components/BackgroundBlobs";
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
  const location = useLocation();
  const isMapPage = location.pathname === "/map";

  return (
    <div className="app-shell">
      <BackgroundBlobs />
      <Navbar />
      <div className="page-content" style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cafes" element={<Cafes />} />
          <Route path="/cafes/:id" element={<CafeDetails />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/add-cafe" element={
            <ProtectedRoute allowedRoles={["owner", "admin"]}>
              <AddCafe />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner-dashboard" element={
            <ProtectedRoute allowedRoles={["owner"]}>
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
      {!isMapPage && <Footer />}
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
