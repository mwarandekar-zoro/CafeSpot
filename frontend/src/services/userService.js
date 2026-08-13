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
};
