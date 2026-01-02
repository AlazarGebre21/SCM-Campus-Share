import { MessageSquare, ArrowBigUp, ArrowBigDown, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const TopicCard = ({ topic }) => {
  const voteCount = (topic.upvote_count || 0) - (topic.downvote_count || 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 min-w-[50px] text-slate-500">
          <span className="text-lg font-bold text-slate-700">{voteCount}</span>
          <span className="text-xs">votes</span>
        </div>

        {/* Content Column */}
        <div className="flex-1">
          <Link to={`/app/forum/${topic.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
              {topic.title}
            </h3>
          </Link>

          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {topic.content}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex gap-2">
              {topic.course && (
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                  {topic.course.code || topic.course.name}
                </span>
              )}
              {topic.is_pinned && (
                <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md font-medium">
                  Pinned
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MessageSquare size={14} /> {topic.reply_count} replies
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {topic.created_at
                  ? formatDistanceToNow(new Date(topic.created_at), {
                      addSuffix: true,
                    })
                  : "Just now"}
              </span>
              <span>
                by{" "}
                <span className="text-slate-600 font-medium">
                  {topic.user?.first_name}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
