import { useState, useEffect } from "react";
import { forumService } from "../../services/forum.service";
import TopicCard from "../../features/forum/TopicCard";
import { MessageCircle, Plus, Loader2, Search } from "lucide-react";

const ForumFeed = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("newest"); // newest, popular

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", content: "" });

  useEffect(() => {
    loadTopics();
  }, [filter]);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await forumService.getTopics({ sort_by: filter });
      setTopics(data.topics || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await forumService.createTopic(newTopic);
      setIsModalOpen(false);
      setNewTopic({ title: "", content: "" });
      loadTopics(); // Refresh list
    } catch (error) {
      alert("Failed to create topic");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Community Forum
          </h1>
          <p className="text-slate-500 mt-1">
            Ask questions, discuss courses, and help others.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Ask Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
        {["newest", "popular", "unanswered"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-blue-100 text-blue-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            No discussions yet. Be the first to ask!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}

      {/* Simple Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                placeholder="What's your question? (Title)"
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold"
                value={newTopic.title}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, title: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Describe your problem in detail..."
                rows={5}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none resize-none"
                value={newTopic.content}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, content: e.target.value })
                }
                required
              />
              {/* Note: Course selection would go here in full version */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumFeed;
