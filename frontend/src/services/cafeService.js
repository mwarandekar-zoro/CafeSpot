import api from "./api";

export const cafeService = {
  getCafes: async (params = {}) => {
    const { data } = await api.get("/cafes", { params });
    return data; // { success, total, page, totalPages, limit, cafes }
  },
  getCafeById: async (id) => {
    const { data } = await api.get(`/cafes/${id}`);
    return data; // { success, cafe }
  },
  createCafe: async (cafeData) => {
    const { data } = await api.post("/cafes", cafeData);
    return data;
  },
  updateCafe: async (id, cafeData) => {
    const { data } = await api.put(`/cafes/${id}`, cafeData);
    return data;
  },
  deleteCafe: async (id) => {
    const { data } = await api.delete(`/cafes/${id}`);
    return data;
  },
  getCafeReviews: async (id) => {
    const { data } = await api.get(`/cafes/${id}/reviews`);
    return data;
  },
  addReview: async (id, reviewData) => {
    const { data } = await api.post(`/cafes/${id}/reviews`, reviewData);
    return data;
  },
  updateCafeReview: async (reviewId, reviewData) => {
    const { data } = await api.put(`/reviews/${reviewId}`, reviewData);
    return data;
  },
  deleteCafeReview: async (reviewId) => {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    return data;
  },
};
