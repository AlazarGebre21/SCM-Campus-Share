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

  async deleteBookmark(bookmarkId) {
    const response = await api.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  },

  // --- Follow and UnFollow

  async followUser(userId) {
    const response = await api.post(`/follows/users/${userId}`);
    return response.data;
  },

  // 2. Unfollow a User
  async unfollowUser(userId) {
    const response = await api.delete(`/follows/users/${userId}`);
    return response.data;
  },

  // 3. Check if I am following a user
  async checkFollowStatus(userId) {
    const response = await api.get(`/follows/users/${userId}/check`);
    return response.data.is_following;
  },

  // 4. Get User Stats (Followers/Following counts)
  // Note: Usually this comes with user profile, but if separate endpoints:
  async getFollowStats(userId) {
    const [followers, following] = await Promise.all([
      api.get(`/follows/users/${userId}/followers`),
      api.get(`/follows/users/${userId}/following`),
    ]);
    return {
      followerCount: followers.data.total,
      followingCount: following.data.total,
    };
  },

  // 5. Get Activity Feed (Resources from people I follow)
  async getActivityFeed(page = 1) {
    const response = await api.get(`/follows/feed`, {
      params: { page, page_size: 20 },
    });
    return response.data;
  },
};
