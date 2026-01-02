// import { useState, useEffect, useCallback } from "react";
// import { resourceService } from "../services/resource.service";
// import ResourceCard from "../features/resources/ResourceCard";
// import { Search, Loader2, X, Filter, SortAsc } from "lucide-react";
// import { useAuth } from "../features/auth/AuthContext";

// const Dashboard = () => {
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   // NEW: Filter States
//   const [selectedType, setSelectedType] = useState("");
//   const [sortBy, setSortBy] = useState("newest");

//   const { user } = useAuth();

//   // Debounce Logic
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       loadResources();
//     }, 500);

//     return () => clearTimeout(delayDebounceFn);
//   }, [searchTerm, selectedType, sortBy]); // Reload when any filter changes

//   const loadResources = async () => {
//     setLoading(true);
//     try {
//       // We pass the filters to the service
//       const params = {
//         search: searchTerm,
//         page_size: 20,
//         sort_by: sortBy,
//       };

//       // Only add type if it's not empty (default "All")
//       if (selectedType) {
//         params.type = selectedType;
//       }

//       const data = await resourceService.getAll(params);
//       setResources(data.resources || []);
//     } catch (error) {
//       console.error("Failed to load resources:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearSearch = () => {
//     setSearchTerm("");
//     setSelectedType("");
//     setSortBy("newest");
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
//       {/* Header Section */}
//       <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 shadow-2xl shadow-indigo-200">
//         <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500 opacity-50" />

//         <div className="relative z-10 flex flex-col gap-6">
//           <div className="text-white">
//             <h1 className="text-3xl font-extrabold tracking-tight">
//               Academic Resources
//             </h1>
//             <p className="mt-2 text-indigo-100 font-medium opacity-90">
//               Welcome back, {user?.first_name}. Find exactly what you need.
//             </p>
//           </div>

//           {/* COMPREHENSIVE SEARCH BAR ROW */}
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* 1. Main Text Search */}
//             <div className="relative flex-1 group">
//               <Search
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-600 z-10"
//                 size={22}
//               />
//               <input
//                 type="text"
//                 placeholder="Search titles or descriptions..."
//                 className="w-full pl-12 pr-10 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-white/20 outline-none transition-all shadow-lg"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm("")}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white"
//                 >
//                   <X size={16} />
//                 </button>
//               )}
//             </div>

//             {/* 2. Resource Type Filter */}
//             <div className="relative md:w-48">
//               <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-200">
//                 <Filter size={18} />
//               </div>
//               <select
//                 className="w-full pl-10 pr-8 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-white/20 outline-none transition-all"
//                 value={selectedType}
//                 onChange={(e) => setSelectedType(e.target.value)}
//               >
//                 <option value="" className="text-slate-900">
//                   All Types
//                 </option>
//                 <option value="notes" className="text-slate-900">
//                   Lecture Notes
//                 </option>
//                 <option value="slides" className="text-slate-900">
//                   Slides
//                 </option>
//                 <option value="exam" className="text-slate-900">
//                   Exam Papers
//                 </option>
//                 <option value="assignment" className="text-slate-900">
//                   Assignments
//                 </option>
//                 <option value="textbook" className="text-slate-900">
//                   Textbooks
//                 </option>
//               </select>
//             </div>

//             {/* 3. Sort Filter */}
//             <div className="relative md:w-48">
//               <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-200">
//                 <SortAsc size={18} />
//               </div>
//               <select
//                 className="w-full pl-10 pr-8 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-white/20 outline-none transition-all"
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="newest" className="text-slate-900">
//                   Newest First
//                 </option>
//                 <option value="popular" className="text-slate-900">
//                   Most Popular
//                 </option>
//                 <option value="rating" className="text-slate-900">
//                   Highest Rated
//                 </option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Results Section */}
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-bold text-slate-800">
//             {searchTerm ? `Results for "${searchTerm}"` : "Recent Resources"}
//           </h2>
//           {/* Show active filters summary */}
//           {(selectedType || sortBy !== "newest") && (
//             <button
//               onClick={clearSearch}
//               className="text-sm text-indigo-600 hover:underline"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>

//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-24 space-y-4">
//             <Loader2 className="animate-spin text-indigo-600" size={48} />
//             <p className="text-slate-400 font-medium">Loading resources...</p>
//           </div>
//         ) : resources.length === 0 ? (
//           <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
//             <Search size={48} className="mx-auto text-slate-300 mb-4" />
//             <p className="text-slate-600 text-lg font-bold">
//               No resources found
//             </p>
//             <p className="text-sm text-slate-400">
//               Try adjusting your search terms or filters.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {resources.map((res) => (
//               <div
//                 key={res.id}
//                 className="transition-transform duration-300 hover:-translate-y-2"
//               >
//                 <ResourceCard resource={res} />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import { useState, useEffect } from "react";
import { resourceService } from "../services/resource.service";
import { socialService } from "../services/social.service";
import ResourceCard from "../features/resources/ResourceCard";
import {
  Search,
  Loader2,
  X,
  Filter,
  SortAsc,
  Sparkles,
  Compass,
  Users,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const { user } = useAuth();

  // Data States
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState("explore"); // 'explore' | 'following'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Bookmark Sync State (Map<ResourceId, BookmarkId>)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Map());

  // --- DATA LOADING LOGIC ---

  // Trigger load when filters change or tab changes
  useEffect(() => {
    setResources([]);
    setLoading(true); // Force loading state
    // Debounce to prevent too many API calls while typing
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedType, sortBy, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Determine which main data to fetch based on Tab
      let mainDataPromise;

      if (activeTab === "following") {
        // Fetch Activity Feed
        mainDataPromise = socialService.getActivityFeed();
      } else {
        // Fetch Global Explore Data with Filters
        const params = {
          search: searchTerm,
          page_size: 20,
          sort_by: sortBy,
        };
        if (selectedType) params.type = selectedType;
        mainDataPromise = resourceService.getAll(params);
      }

      // 2. Determine if we need Recommendations (Only on Explore + No Search)
      const shouldFetchRecs = activeTab === "explore" && !searchTerm;
      const recPromise = shouldFetchRecs
        ? resourceService.getRecommendations(3).catch(() => [])
        : Promise.resolve([]);

      // 3. Always fetch bookmarks to sync icons
      const bookmarkPromise = socialService.getBookmarks().catch(() => []);

      // 4. EXECUTE ALL REQUESTS IN PARALLEL
      const [mainData, recData, bookmarkData] = await Promise.all([
        mainDataPromise,
        recPromise,
        bookmarkPromise,
      ]);

      // 5. Update State
      setResources(mainData.resources || []);
      setRecommendations(recData || []);

      // 6. Map Bookmarks for O(1) Lookup
      const bMap = new Map();
      if (bookmarkData) {
        bookmarkData.forEach((b) => bMap.set(b.resource.id, b.id));
      }
      setBookmarkedIds(bMap);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedType("");
    setSortBy("newest");
  };

  // --- RENDER ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 shadow-xl shadow-blue-200">
        {/* Decorative Circle */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500 opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="text-white">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Academic Resources
            </h1>
            <p className="mt-2 text-blue-100 font-medium opacity-90">
              Welcome back, {user?.first_name}.
              {activeTab === "explore"
                ? " Find exactly what you need."
                : " Here is what your network is sharing."}
            </p>
          </div>

          {/* TABS NAVIGATION INSIDE HEADER */}
          <div className="flex items-center gap-2 bg-blue-700/30 p-1 rounded-xl w-fit backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("explore")}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "explore"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-blue-100 hover:bg-blue-600/50"
              }`}
            >
              <Compass size={16} /> Explore
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "following"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-blue-100 hover:bg-blue-600/50"
              }`}
            >
              <Users size={16} /> Following
            </button>
          </div>

          {/* SEARCH & FILTERS (Only show on Explore Tab) */}
          {activeTab === "explore" && (
            <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Text Input */}
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 z-10"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search titles, topics, or courses..."
                  className="w-full pl-11 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 backdrop-blur-md focus:bg-white focus:text-slate-900 outline-none transition-all shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 text-blue-200 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="relative md:w-40">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 pointer-events-none"
                />
                <select
                  className="w-full pl-9 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:bg-white focus:text-slate-900 outline-none transition-all"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="" className="text-slate-900">
                    All Types
                  </option>
                  <option value="notes" className="text-slate-900">
                    Notes
                  </option>
                  <option value="slides" className="text-slate-900">
                    Slides
                  </option>
                  <option value="exam" className="text-slate-900">
                    Exams
                  </option>
                  <option value="assignment" className="text-slate-900">
                    Homework
                  </option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="relative md:w-40">
                <SortAsc
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 pointer-events-none"
                />
                <select
                  className="w-full pl-9 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:bg-white focus:text-slate-900 outline-none transition-all"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest" className="text-slate-900">
                    Newest
                  </option>
                  <option value="popular" className="text-slate-900">
                    Popular
                  </option>
                  <option value="rating" className="text-slate-900">
                    Rated
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. RECOMMENDATIONS (Only on Explore + No Search) */}
      {activeTab === "explore" &&
        !searchTerm &&
        recommendations.length > 0 &&
        !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-slate-800 px-1">
              <Sparkles className="text-yellow-500 fill-yellow-500" size={20} />
              <h2 className="text-xl font-bold">Recommended for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <ResourceCard
                  key={rec.id}
                  resource={{
                    ...rec,
                    is_bookmarked: !!bookmarkedIds.get(rec.id),
                    bookmark_id: bookmarkedIds.get(rec.id),
                  }}
                />
              ))}
            </div>
          </div>
        )}

      {/* 3. MAIN CONTENT GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-t border-slate-100 pt-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {activeTab === "following" ? (
              "Activity Feed"
            ) : searchTerm ? (
              <span>
                Results for "<span className="text-blue-600">{searchTerm}</span>
                "
              </span>
            ) : (
              "Recent Uploads"
            )}
          </h2>

          {(searchTerm || selectedType || sortBy !== "newest") &&
            activeTab === "explore" && (
              <button
                onClick={clearSearch}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Clear filters
              </button>
            )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-medium">Loading content...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            {activeTab === "following" ? (
              <>
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 text-lg font-bold">
                  Your feed is empty
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Follow other students to see their uploads here.
                </p>
              </>
            ) : (
              <>
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 text-lg font-bold">
                  No resources found
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Try adjusting your filters or search terms.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {resources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={{
                  ...res,
                  is_bookmarked: !!bookmarkedIds.get(res.id),
                  bookmark_id: bookmarkedIds.get(res.id),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
