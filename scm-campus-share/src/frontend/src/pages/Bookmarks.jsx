import { useState, useEffect } from "react";
import { socialService } from "../services/social.service";
import ResourceCard from "../features/resources/ResourceCard";
import { Bookmark, Loader2 } from "lucide-react";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const data = await socialService.getBookmarks();
      setBookmarks(data || []);
    } catch (error) {
      console.error("Failed to load bookmarks", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bookmark className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Saved Resources</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-dashed text-gray-500">
          No bookmarks yet. Go explore resources!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            // PDF Page 11: Bookmark object contains { id, resource: {...} }
            // We pass the nested resource object to the card
            <ResourceCard key={bookmark.id} resource={bookmark.resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
