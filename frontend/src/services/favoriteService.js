import api from "./api";

export const favoriteService = {
  getFavorites: async () => {
    const { data } = await api.get("/favorites");
    return data; // { success, count, favorites }
  },
  addFavorite: async (cafeId) => {
    const { data } = await api.post(`/favorites/${cafeId}`);
    return data; // { success, message, favorite }
  },
  removeFavorite: async (cafeId) => {
    const { data } = await api.delete(`/favorites/${cafeId}`);
    return data; // { success, message }
  },
};
