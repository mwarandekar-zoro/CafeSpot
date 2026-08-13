import api from "./api";

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data; // { success, token, user }
  },
  register: async (name, email, password, role) => {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    return data; // { success, token, user }
  },
};
