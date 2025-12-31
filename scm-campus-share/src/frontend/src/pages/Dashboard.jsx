import { useState, useEffect } from "react";
import { resourceService } from "../services/resource.service";
import ResourceCard from "../features/resources/ResourceCard";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Debounce search could be added here, but for now simple fetch
  useEffect(() => {
    loadResources();
  }, [searchTerm]); // Reload when search changes (basic implementation)

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getAll({
        search: searchTerm,
        page_size: 20,
      });
      setResources(data.resources || []);
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Academic Resources
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.first_name}. Here is what's new.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search notes, slides..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-500 text-lg">No resources found.</p>
          <p className="text-sm text-gray-400">
            Try adjusting your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
