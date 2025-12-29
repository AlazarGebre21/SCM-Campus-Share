import api from "../lib/axios";

export const authService = {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put("/auth/profile", data);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data.user;
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};
