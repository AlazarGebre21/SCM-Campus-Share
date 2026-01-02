import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { forumService } from "../../services/forum.service";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../features/auth/AuthContext";

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    loadThread();
  }, [id]);

  const loadThread = async () => {
    setLoading(true);
    try {
      // Fetch topic and its replies
      const [tData, rData] = await Promise.all([
        forumService.getTopicById(id),
        forumService.getReplies(id), // Sometimes replies are separate
      ]);
      setTopic(tData);
      setReplies(rData || tData.replies || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (isUpvote) => {
    // Optimistic UI update could be added here
    try {
      await forumService.voteTopic(id, isUpvote);
      loadThread(); // Reload to get fresh count
    } catch (e) {
      alert("Vote failed");
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await forumService.createReply(id, replyContent);
      setReplyContent("");
      loadThread(); // Reload to show new reply
    } catch (e) {
      alert("Failed to reply");
    }
  };

  if (loading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate("/app/forum")}
        className="text-slate-500 hover:text-blue-600 flex items-center mb-6"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Forum
      </button>

      {/* Main Question */}
      <div className="flex gap-6 mb-10">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"
          >
            <ArrowBigUp size={32} />
          </button>
          <span className="text-xl font-bold text-slate-800">
            {(topic.upvote_count || 0) - (topic.downvote_count || 0)}
          </span>
          <button
            onClick={() => handleVote(false)}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600"
          >
            <ArrowBigDown size={32} />
          </button>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4">
            {topic.title}
          </h1>
          <div className="prose max-w-none text-slate-700 mb-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            {topic.content}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-bold text-blue-600">
              {topic.user?.first_name}
            </span>{" "}
            asked {formatDistanceToNow(new Date(topic.created_at))} ago
          </div>
        </div>
      </div>

      {/* Reply Input */}
      <div className="mb-10 pl-16">
        <form
          onSubmit={handleSubmitReply}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200"
        >
          <textarea
            className="w-full bg-transparent outline-none resize-y min-h-[100px]"
            placeholder="Type your answer here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              Post Answer
            </button>
          </div>
        </form>
      </div>

      {/* Replies List */}
      <div className="pl-4 md:pl-16 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">
          {replies.length} Answers
        </h3>
        {replies.map((reply) => (
          <div key={reply.id} className="flex gap-4 group">
            {/* Simple Vote for Reply */}
            <div className="flex flex-col items-center pt-1 text-slate-400">
              <ArrowBigUp
                size={24}
                className="cursor-pointer hover:text-blue-600"
              />
              <span className="font-bold text-sm text-slate-600">
                {reply.upvote_count || 0}
              </span>
            </div>

            <div className="flex-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-slate-800 mb-3">{reply.content}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-bold text-slate-600">
                  {reply.user?.first_name}
                </span>{" "}
                answered {formatDistanceToNow(new Date(reply.created_at))} ago
              </div>

              {/* Nested replies would recursively render here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicDetails;
