import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import {
  LayoutGrid,
  UploadCloud,
  User,
  LogOut,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { cn } from "../lib/utils";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutGrid, label: "Feed", path: "/app" },
    { icon: UploadCloud, label: "Upload Resource", path: "/app/upload" },
    { icon: Bookmark, label: "Saved", path: "/app/bookmarks" },
    { icon: User, label: "Profile", path: "/app/profile" },
    { icon: MessageSquare, label: "Chat (Coming soon...)", path: "/app/chat" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
            CampusShare
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {user?.first_name?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-5.5 rounded-md hover:bg-red-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64">
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
