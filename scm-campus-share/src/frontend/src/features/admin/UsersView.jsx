import { Ban, CheckCircle, Search } from "lucide-react";

const UsersView = ({ users, onBanToggle }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Simple Search Mock */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          placeholder="Search users by email..."
          className="w-full pl-12 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-slate-500">{user.email}</p>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      user.role === "admin"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  {user.status === "banned" ? (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <Ban size={14} /> Banned
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle size={14} /> Active
                    </span>
                  )}
                </td>
                <td className="p-4 text-slate-500">{user.joined_at}</td>
                <td className="p-4 text-right">
                  {user.role !== "admin" && (
                    <button
                      onClick={() =>
                        onBanToggle(user.id, user.status === "active")
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        user.status === "active"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {user.status === "active" ? "Ban User" : "Unban"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersView;
