import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resourceService } from "../services/resource.service";
import { socialService } from "../services/social.service";
import ResourceCard from "../features/resources/ResourceCard";
import {
  User,
  Users,
  BookOpen,
  UserPlus,
  UserCheck,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const PublicProfile = () => {
  const { id } = useParams(); // The ID of the user we are viewing
  const { user: currentUser } = useAuth(); // Me
  const navigate = useNavigate(); // Navigation hook

  // State
  const [profileUser, setProfileUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ followerCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if we are viewing our own profile
  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // 1. Fetch User Resources to populate the grid AND get user details
      // (Since we don't have a direct public GET /users/:id endpoint, we infer details from their uploads)
      const userResources = await resourceService.getAll({ page_size: 50 });

      // 2. Fetch Follow Status & Stats in parallel
      const [followStatus, followStats] = await Promise.all([
        !isOwnProfile
          ? socialService.checkFollowStatus(id).catch(() => false)
          : Promise.resolve(false),
        socialService
          .getFollowStats(id)
          .catch(() => ({ followerCount: 0, followingCount: 0 })),
      ]);

      setIsFollowing(followStatus);
      setStats(followStats);

      // 3. Filter resources for this specific user
      // Note: In a real backend, you would do api.get(`/resources?user_id=${id}`)
      const userUploads = userResources.resources.filter(
        (r) => r.user.id === id
      );
      setResources(userUploads);

      // 4. Set Profile Info
      if (userUploads.length > 0) {
        setProfileUser(userUploads[0].user);
      } else {
        // Fallback mock if they haven't uploaded anything but exist
        setProfileUser({ first_name: "Academic", last_name: "User" });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await socialService.unfollowUser(id);
        setIsFollowing(false);
        setStats((prev) => ({
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1),
        }));
      } else {
        await socialService.followUser(id);
        setIsFollowing(true);
        setStats((prev) => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));
      }
    } catch (error) {
      alert("Action failed. Try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      {/* 1. BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      {/* 2. PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-50 relative overflow-hidden">
        {/* Decorative Gradient Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-blue-400 opacity-10" />

        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-10">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
            <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold border-2 border-white">
              {profileUser?.first_name?.[0] || <User size={40} />}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {profileUser?.first_name} {profileUser?.last_name}
            </h1>
            <p className="text-slate-500 font-medium">
              Student • {profileUser?.university?.name || "University Member"}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Users size={18} className="text-blue-500" />
                <span className="font-bold">{stats.followerCount}</span>{" "}
                <span className="text-slate-500 text-sm">Followers</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Users size={18} className="text-blue-500" />
                <span className="font-bold">{stats.followingCount}</span>{" "}
                <span className="text-slate-500 text-sm">Following</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <BookOpen size={18} className="text-blue-500" />
                <span className="font-bold">{resources.length}</span>{" "}
                <span className="text-slate-500 text-sm">Uploads</span>
              </div>
            </div>
          </div>

          {/* Follow/Unfollow Action Button */}
          {!isOwnProfile && (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isFollowing
                  ? "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              }`}
            >
              {followLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isFollowing ? (
                <>
                  {" "}
                  <UserCheck size={20} /> Following{" "}
                </>
              ) : (
                <>
                  {" "}
                  <UserPlus size={20} /> Follow{" "}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 3. USER'S RESOURCES GRID */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
          Contributions
        </h2>

        {resources.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <BookOpen className="mx-auto mb-3 opacity-50" size={40} />
            <p>No resources uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
