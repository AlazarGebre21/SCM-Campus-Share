import { useState, useEffect } from "react";
import { socialService } from "../../services/social.service";
import { useAuth } from "../auth/AuthContext";
import { User, Send, Loader2 } from "lucide-react";

const CommentSection = ({ resourceId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [resourceId]);

  const loadComments = async () => {
    try {
      const data = await socialService.getComments(resourceId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const addedComment = await socialService.addComment(
        resourceId,
        newComment
      );
      // Optimistically add to list
      setComments([addedComment, ...comments]);
      setNewComment("");
    } catch (error) {
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Discussion ({comments.length})
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="font-bold text-blue-600">
            {user?.first_name?.[0]}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              Post Comment
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="animate-spin inline" />
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={20} className="text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {comment.user?.first_name} {comment.user?.last_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
