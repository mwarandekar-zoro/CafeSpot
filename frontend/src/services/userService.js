import api from "./api";

export const userService = {
  getProfile: async () => {
    const { data } = await api.get("/users/profile");
    return data; // { success, user }
  },
  updateProfile: async (profileData) => {
    const { data } = await api.put("/users/profile", profileData);
    return data; // { success, message, user }
  },
  getMyReviews: async () => {
    const { data } = await api.get("/users/reviews");
    return data; // { success, count, reviews }
  },
  getMyCafes: async () => {
    const { data } = await api.get("/users/cafes");
    return data; // { success, count, cafes }
  },
  getMyFavorites: async () => {
    const { data } = await api.get("/users/favorites");
    return data; // { success, count, favorites }
  },
  getOwnerDashboard: async () => {
    const { data } = await api.get("/users/owner-dashboard");
    return data; // { success, stats, cafes }
  },
  getAdminDashboard: async () => {
    const { data } = await api.get("/users/admin-dashboard");
    return data; // { success, stats, cafes }
  },
  getAllUsers: async () => {
    const { data } = await api.get("/users");
    return data; // { success, count, users }
  },
  updateUserRole: async (userId, role) => {
    const { data } = await api.put(`/users/${userId}/role`, { role });
    return data; // { success, message, user }
  },
  toggleUserStatus: async (userId) => {
    const { data } = await api.put(`/users/${userId}/status`);
    return data; // { success, message, user }
  },
};
