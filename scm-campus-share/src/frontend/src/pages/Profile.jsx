import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { authService } from "../services/auth.service";
import { socialService } from "../services/social.service"; // Import social service
import {
  Loader2,
  User,
  Mail,
  BookOpen,
  GraduationCap,
  Edit3,
  Check,
  X,
  Users,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ followerCount: 0, followingCount: 0 }); // New Stats State

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    major: user?.major || "",
    year: user?.year || 1,
  });

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id) {
        try {
          const data = await socialService.getFollowStats(user.id);
          setStats(data);
        } catch (error) {
          console.error("Failed to load stats", error);
        }
      }
    };
    fetchStats();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(formData);
      alert("Profile updated successfully!");
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Manage your university profile and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Stats Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center sticky top-8">
            <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-4 border-2 border-indigo-50 shadow-inner text-3xl font-bold">
              {user?.first_name?.[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {user?.email}
            </p>

            {/* NEW: Follow Stats Section */}
            <div className="flex justify-center gap-6 mt-6 py-4 border-t border-b border-slate-50">
              <div className="text-center">
                <span className="block text-lg font-bold text-slate-800">
                  {stats.followerCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Followers
                </span>
              </div>
              <div className="w-px bg-slate-100 h-10"></div>
              <div className="text-center">
                <span className="block text-lg font-bold text-slate-800">
                  {stats.followingCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Following
                </span>
              </div>
            </div>

            <div className="mt-6">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {user?.role || "Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="text-indigo-600" size={20} /> Personal
                Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-colors"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                    First Name
                  </label>
                  <input
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 disabled:opacity-60 transition-all"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Last Name
                  </label>
                  <input
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 disabled:opacity-60 transition-all"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <BookOpen size={14} /> Major
                  </label>
                  <input
                    disabled={!isEditing}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 disabled:opacity-60 transition-all"
                    value={formData.major}
                    onChange={(e) =>
                      setFormData({ ...formData, major: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <GraduationCap size={14} /> Academic Year
                  </label>
                  <select
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 disabled:opacity-60 transition-all appearance-none bg-white"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>
                        {y}
                        {y === 1
                          ? "st"
                          : y === 2
                          ? "nd"
                          : y === 3
                          ? "rd"
                          : "th"}{" "}
                        Year
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 border-t border-slate-50 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Check size={18} />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
