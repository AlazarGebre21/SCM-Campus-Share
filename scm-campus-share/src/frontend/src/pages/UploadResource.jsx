import { useState } from "react";
import { resourceService } from "../services/resource.service";
import { useNavigate } from "react-router-dom";
import { UploadCloud, File, X, Loader2 } from "lucide-react";

const UploadResource = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "notes",
    sharing_level: "public",
    tags: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload.");

    setLoading(true);

    // Create FormData object (Standard Browser API)
    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("type", formData.type);
    data.append("sharing_level", formData.sharing_level);

    // Optional: Add tags if they exist
    if (formData.tags) {
      data.append("tags", formData.tags);
    }

    try {
      await resourceService.upload(data);
      // Redirect to dashboard on success
      navigate("/app");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Upload New Resource
        </h1>
        <p className="text-gray-500">
          Share your notes and materials with the community.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative group cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.ppt,.pptx" // Add allowed types
            />

            {!file ? (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
                </div>
                <span className="text-gray-900 font-medium text-lg">
                  Click to upload or drag and drop
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  PDF, DOC, PPT up to 100MB
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <File className="text-blue-600" size={24} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                  }}
                  className="p-1 hover:bg-blue-100 rounded z-20"
                >
                  <X size={20} className="text-blue-700" />
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Title
              </label>
              <input
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Calculus I - Midterm Review"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what's inside this file..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Type
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="notes">Lecture Notes</option>
                  <option value="slides">Presentation Slides</option>
                  <option value="assignment">Assignment / HW</option>
                  <option value="exam">Exam Paper</option>
                  <option value="textbook">Textbook</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sharing Level
                </label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                  value={formData.sharing_level}
                  onChange={(e) =>
                    setFormData({ ...formData, sharing_level: e.target.value })
                  }
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="university">My University Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="math, calculus, review (comma separated)"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UploadCloud size={20} />
              )}
              {loading ? "Uploading..." : "Publish Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadResource;
