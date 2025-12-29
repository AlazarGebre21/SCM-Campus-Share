import { FileText, Download, Eye, Clock, File } from "lucide-react";
import { Link } from "react-router-dom";
import { resourceService } from "../../services/resource.service";

const ResourceCard = ({ resource }) => {
  const handleDownload = async () => {
    try {
      const url = await resourceService.getDownloadUrl(resource.id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download file");
    }
  };

  const getIcon = (type) => {
    // Simple icon switching based on type
    return <FileText className="text-blue-600" size={24} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start gap-3">
        <div className="p-3 bg-blue-50 rounded-lg shrink-0">
          {getIcon(resource.type)}
        </div>
        <div className="flex-1 min-w-0">
          {/* Wrap Title in Link */}
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

      <div className="mt-5 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5" title="Downloads">
            <Download size={14} /> {resource.download_count}
          </span>
          <span className="flex items-center gap-1.5" title="Views">
            <Eye size={14} /> {resource.view_count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Download size={16} /> Download
      </button>
    </div>
  );
};

export default ResourceCard;
