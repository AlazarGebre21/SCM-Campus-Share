// src/features/resources/ResourceCard.jsx
import { useState } from "react";
// Added Star and User to imports
import {
  FileText,
  Download,
  Eye,
  Clock,
  Bookmark,
  Star,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { resourceService } from "../../services/resource.service";
import { socialService } from "../../services/social.service";
import { cn } from "../../lib/utils";

const ResourceCard = ({ resource, onUnbookmark }) => {
  // Initialize state from props
  const [isBookmarked, setIsBookmarked] = useState(
    resource.is_bookmarked || false
  );
  const [bookmarkId, setBookmarkId] = useState(resource.bookmark_id || null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    // Prevent default if it's inside a form or link, though mostly handled by button
    if (e) e.preventDefault();
    try {
      const url = await resourceService.getDownloadUrl(resource.id);
      window.open(url, "_blank");
    } catch (error) {
      alert("Failed to download file");
    }
  };

  const toggleBookmark = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isBookmarked) {
        // DELETE LOGIC
        if (!bookmarkId) {
          throw new Error("Missing bookmark ID");
        }
        await socialService.deleteBookmark(bookmarkId);

        setIsBookmarked(false);
        setBookmarkId(null);

        // If parent passed a callback (like in Bookmarks page), call it
        if (onUnbookmark) onUnbookmark();
      } else {
        // ADD LOGIC
        const newBookmark = await socialService.addBookmark(resource.id);

        setIsBookmarked(true);
        setBookmarkId(newBookmark.id);
      }
    } catch (error) {
      console.error(error);
      alert("Check your connection: Bookmark sync failed");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => <FileText className="text-blue-600" size={24} />;

  // Helper to safely get user name
  const authorName = resource.user
    ? `${resource.user.first_name} ${resource.user.last_name}`
    : resource.author_name || "Anonymous";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 relative group">
      {/* BOOKMARK BUTTON TOP-RIGHT */}
      <button
        onClick={toggleBookmark}
        className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors z-10 cursor-pointer"
        title={isBookmarked ? "Remove Bookmark" : "Save Resource"}
      >
        <Bookmark
          size={20}
          className={cn(
            "transition-all",
            isBookmarked ? "fill-blue-600 text-blue-600" : ""
          )}
        />
      </button>

      {/* Main Content */}
      <div className="flex justify-between items-start gap-3">
        <div className="p-3 bg-blue-50 rounded-lg shrink-0">
          {getIcon(resource.type)}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <Link to={`/app/resource/${resource.id}`} className="hover:underline">
            <h3
              className="font-semibold text-gray-900 truncate"
              title={resource.title}
            >
              {resource.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">
            {resource.description || "No description provided."}
          </p>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {resource.tags?.slice(0, 3).map((t, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200"
              >
                #{t.tag?.name || t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION FROM COMMENTED CODE: Author & Rating --- */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <User size={14} />
          {/* LINK TO PROFILE */}
          {resource.user ? (
            <Link
              to={`/app/users/${resource.user.id}`}
              className="text-xs font-medium hover:text-blue-600 hover:underline transition-colors"
            >
              {authorName}
            </Link>
          ) : (
            <span className="text-xs font-medium">{authorName}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={14} className="fill-current" />
          <span className="text-xs font-bold">
            {resource.average_rating || "0.0"}
          </span>
        </div>
      </div>

      {/* Footer: Downloads, Views, Date */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Download size={14} /> {resource.download_count}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={14} /> {resource.view_count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        // UPDATED CLASSES:
        // - bg-blue-600 text-white (Blue background, white text)
        // - hover:bg-blue-700 (Darker blue on hover)
        // - cursor-pointer (Hand icon)
        // - Removed border classes that were used for the white button
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
      >
        <Download size={16} /> Download
      </button>
    </div>
  );
};

export default ResourceCard;
