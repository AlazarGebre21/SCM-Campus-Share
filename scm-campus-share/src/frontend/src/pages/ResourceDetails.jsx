import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resourceService } from "../services/resource.service";
import { socialService } from "../services/social.service";
import CommentSection from "../features/social/CommentSection";
import StarRating from "../components/StarRating";
import {
  Download,
  Bookmark,
  ArrowLeft,
  Calendar,
  User,
  FileText,
} from "lucide-react";

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Fetch resource details and rating stats in parallel
      const [resData, ratingData] = await Promise.all([
        resourceService.getById(id),
        socialService.getRating(id),
      ]);

      setResource(resData);
      setRatingStats({
        average: ratingData.average || 0,
        count: ratingData.count || 0,
      });
      // If user has rated, set their rating
      if (ratingData.user_rating) {
        setUserRating(ratingData.user_rating.value);
      }
    } catch (error) {
      console.error("Error loading resource", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const url = await resourceService.getDownloadUrl(id);
      window.open(url, "_blank");
    } catch (error) {
      alert("Error getting download link");
    }
  };

  const handleRate = async (value) => {
    try {
      await socialService.rateResource(id, value);
      setUserRating(value);
      // Refresh stats lightly (optional)
      const newStats = await socialService.getRating(id);
      setRatingStats({ average: newStats.average, count: newStats.count });
    } catch (error) {
      console.error(error);
      alert("Failed to submit rating");
    }
  };

  const handleBookmark = async () => {
    try {
      await socialService.addBookmark(id);
      alert("Resource bookmarked!");
    } catch (error) {
      alert("Already bookmarked or error occurred.");
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading details...</div>;
  if (!resource)
    return <div className="p-10 text-center">Resource not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Resources
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b bg-gray-50/50">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-blue-100 rounded-lg text-blue-600">
                <FileText size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {resource.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User size={16} /> {resource.user?.first_name}{" "}
                    {resource.user?.last_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />{" "}
                    {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium uppercase">
                    {resource.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleBookmark}
                className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600"
                title="Bookmark"
              >
                <Bookmark size={20} />
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Download size={20} /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8">
          <div className="prose max-w-none text-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p>{resource.description || "No description provided."}</p>
          </div>

          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl mb-8">
            <div>
              <span className="block text-sm font-medium text-gray-500 mb-1">
                Average Rating
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {ratingStats.average.toFixed(1)}
                </span>
                <div className="flex text-yellow-400">
                  <StarRating
                    initialRating={Math.round(ratingStats.average)}
                    readOnly={true}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  ({ratingStats.count} reviews)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-sm font-medium text-gray-500 mb-1">
                Your Rating
              </span>
              <StarRating initialRating={userRating} onRate={handleRate} />
            </div>
          </div>

          {/* Comment Section Integration */}
          <CommentSection resourceId={id} />
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
