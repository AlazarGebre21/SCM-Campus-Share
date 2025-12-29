import api from "../lib/axios";

export const socialService = {
  // --- COMMENTS ---
  // GET /resources/:id/comments (PDF Page 8)
  async getComments(resourceId) {
    const response = await api.get(`/resources/${resourceId}/comments`);
    return response.data.comments;
  },

  // POST /resources/:id/comments (PDF Page 9)
  async addComment(resourceId, content) {
    const response = await api.post(`/resources/${resourceId}/comments`, {
      content,
    });
    return response.data.comment;
  },

  // --- RATINGS ---
  // GET /resources/:id/rating (PDF Page 10)
  async getRating(resourceId) {
    const response = await api.get(`/resources/${resourceId}/rating`);
    return response.data; // Returns { average, count, user_rating: { value } }
  },

  // POST /resources/:id/rating (PDF Page 10)
  async rateResource(resourceId, value) {
    const response = await api.post(`/resources/${resourceId}/rating`, {
      value,
    });
    return response.data.rating;
  },

  // --- BOOKMARKS ---
  // POST /bookmarks (PDF Page 11)
  async addBookmark(resourceId) {
    const response = await api.post("/bookmarks", { resource_id: resourceId });
    return response.data.bookmark;
  },

  // GET /bookmarks (List user bookmarks)
  async getBookmarks() {
    const response = await api.get("/bookmarks");
    return response.data.bookmarks;
  },
};
