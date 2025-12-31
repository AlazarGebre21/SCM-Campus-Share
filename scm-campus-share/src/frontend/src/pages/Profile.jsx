import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { authService } from "../services/auth.service";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth(); // We can use login to refresh context if needed, or just manual update
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    major: user?.major || "",
    year: user?.year || 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
          {user?.first_name?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full uppercase">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                disabled={!isEditing}
                className="w-full p-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                disabled={!isEditing}
                className="w-full p-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major
              </label>
              <input
                disabled={!isEditing}
                placeholder="e.g. Computer Science"
                className="w-full p-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                disabled={!isEditing}
                className="w-full p-2.5 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 bg-white"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
