import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resourceService } from "../services/resource.service";
import { socialService } from "../services/social.service";
import CommentSection from "../features/social/CommentSection";
import StarRating from "../components/StarRating";
import ReportModal from "../components/ReportModal"; // Import Modal
import ResourceCard from "../features/resources/ResourceCard"; // Import Card for similar list
import {
  Download,
  Bookmark,
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Flag,
} from "lucide-react";
import { format } from "date-fns"; // Use date-fns for nice dates

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [resource, setResource] = useState(null);
  const [similarResources, setSimilarResources] = useState([]); // New State
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false); // Modal State

  useEffect(() => {
    // Scroll to top when ID changes (important for "Similar Resource" clicks)
    window.scrollTo(0, 0);
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Parallel Fetch: Details, Ratings, Similar
      const [resData, ratingData, similarData] = await Promise.all([
        resourceService.getById(id),
        socialService.getRating(id).catch(() => ({ average: 0, count: 0 })),
        resourceService.getSimilar(id).catch(() => []), // New API Call
      ]);

      setResource(resData);
      setRatingStats({
        average: ratingData.average || 0,
        count: ratingData.count || 0,
      });
      if (ratingData.user_rating) setUserRating(ratingData.user_rating.value);
      setSimilarResources(similarData);
    } catch (error) {
      console.error("Error loading resource", error);
    } finally {
      setLoading(false);
    }
  };

  // ... keep handleDownload, handleRate, handleBookmark as is ...
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
      const newStats = await socialService.getRating(id);
      setRatingStats({ average: newStats.average, count: newStats.count });
    } catch (error) {
      alert("Failed to submit rating");
    }
  };

  const handleBookmark = async () => {
    try {
      await socialService.addBookmark(id);
      alert("Resource bookmarked!");
    } catch (error) {
      alert("Already bookmarked.");
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-blue-600 font-medium">
        Loading details...
      </div>
    );
  if (!resource)
    return <div className="p-20 text-center">Resource not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-blue-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Resources
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-50">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                      {resource.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <User size={14} /> {resource.user?.first_name}{" "}
                        {resource.user?.last_name}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Calendar size={14} />{" "}
                        {format(new Date(resource.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Download File
                </button>
                <button
                  onClick={handleBookmark}
                  className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Bookmark size={18} /> Save
                </button>
                {/* REPORT BUTTON */}
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-4 py-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-colors"
                  title="Report Content"
                >
                  <Flag size={18} />
                </button>
              </div>
            </div>

            {/* Description & Ratings */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                About this resource
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-line">
                {resource.description || "No description provided."}
              </p>

              <div className="bg-blue-50/50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-100">
                <div>
                  <span className="block text-sm font-semibold text-slate-500 mb-1">
                    Average Rating
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {ratingStats.average.toFixed(1)}
                    </span>
                    <div className="text-yellow-400 scale-110 origin-left">
                      <StarRating
                        initialRating={Math.round(ratingStats.average)}
                        readOnly={true}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400 mt-1 block">
                    {ratingStats.count} ratings
                  </span>
                </div>
                <div className="text-center sm:text-right bg-white p-4 rounded-lg shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Rate this file
                  </span>
                  <StarRating initialRating={userRating} onRate={handleRate} />
                </div>
              </div>

              {/* Comments */}
              <CommentSection resourceId={id} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Similar Resources (Recommendations) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-slate-900 text-lg">
            You might also like
          </h3>

          {similarResources.length > 0 ? (
            <div className="flex flex-col gap-4">
              {similarResources.map((sim) => (
                <div
                  key={sim.id}
                  className="scale-95 origin-top-left hover:scale-100 transition-transform duration-200"
                >
                  <ResourceCard resource={sim} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              No similar resources found.
            </div>
          )}
        </div>
      </div>

      {/* Render Modal */}
      <ReportModal
        resourceId={id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default ResourceDetails;
