import api from "../lib/axios";

export const forumService = {
  // 1. List Topics
  async getTopics(params = {}) {
    const response = await api.get("/forum/topics", { params });
    return response.data; // { topics: [], total: ... }
  },

  // 2. Create Topic
  async createTopic(data) {
    const response = await api.post("/forum/topics", data);
    return response.data.topic;
  },

  // 3. Get Single Topic (Includes nested replies usually, or separate call)
  async getTopicById(id) {
    const response = await api.get(`/forum/topics/${id}`);
    return response.data.topic;
  },

  // 4. Create Reply
  async createReply(topicId, content, parentId = null) {
    const response = await api.post(`/forum/topics/${topicId}/replies`, {
      content,
      parent_id: parentId,
    });
    return response.data.reply;
  },

  // 5. Get Replies (if not included in getTopicById)
  async getReplies(topicId) {
    const response = await api.get(`/forum/topics/${topicId}/replies`);
    return response.data.replies;
  },

  // 6. Vote on Topic
  async voteTopic(topicId, isUpvote) {
    return api.post(`/forum/topics/${topicId}/vote`, { is_upvote: isUpvote });
  },

  // 7. Vote on Reply
  async voteReply(replyId, isUpvote) {
    return api.post(`/forum/replies/${replyId}/vote`, { is_upvote: isUpvote });
  },
};
