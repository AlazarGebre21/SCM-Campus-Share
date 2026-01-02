import api from "../lib/axios";

export const resourceService = {
  // GET /resources (PDF Page 4)
  // params: { page, page_size, search, type, university_id, etc. }
  async getAll(params = {}) {
    const response = await api.get("/resources", { params });
    return response.data; // Returns { resources: [...], total: ..., page: ... }
  },

  // GET /resources/:id (PDF Page 6)
  async getById(id) {
    const response = await api.get(`/resources/${id}`);
    return response.data.resource;
  },

  // POST /resources (PDF Page 6)
  // Payload must be FormData
  async upload(formData) {
    const response = await api.post("/resources", formData, {
      headers: {
        // Important: Let browser set Content-Type to multipart/form-data with boundary
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // GET /resources/:id/download (PDF Page 7)
  async getDownloadUrl(id) {
    const response = await api.get(`/resources/${id}/download`);
    console.log(id);
    return response.data.download_url; // Returns signed S3 URL
  },
  async addBookmark(resourceId) {
    const response = await api.post("/bookmarks", { resource_id: resourceId });
    return response.data;
  },

  async removeBookmark(resourceId) {
    try {
      // If your backend expects a DELETE request to /bookmarks/:id
      const response = await api.delete(`/bookmarks/${resourceId}`);
      return response.data;
    } catch (error) {
      // If the above fails, some backends use a POST to "un-bookmark"
      // or a different URL structure.
      console.warn("Standard delete failed, trying alternative route...");
      throw error;
    }
  },

  // 1. Report a Resource
  async report(id, type, reason) {
    const response = await api.post(`/resources/${id}/report`, {
      type,
      reason,
    });
    return response.data;
  },

  // 2. Get Similar Resources
  async getSimilar(id, limit = 4) {
    const response = await api.get(`/resources/${id}/similar`, {
      params: { limit },
    });
    return response.data.resources;
  },

  // 3. Get Personalized Recommendations
  async getRecommendations(limit = 6) {
    const response = await api.get("/recommendations", {
      params: { limit },
    });
    return response.data.resources;
  },
};
