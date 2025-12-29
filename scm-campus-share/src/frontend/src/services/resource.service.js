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
};
