import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import {
  LayoutGrid,
  UploadCloud,
  User,
  LogOut,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutGrid, label: "Feed", path: "/app" },
    { icon: UploadCloud, label: "Upload", path: "/app/upload" },
    { icon: Bookmark, label: "Saved", path: "/app/bookmarks" },
    { icon: MessageCircle, label: "Forum", path: "/app/forum" },
    { icon: User, label: "Profile", path: "/app/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-8">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-all"
          >
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              CampusShare
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-indigo-600" : "text-slate-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {user?.first_name?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.first_name}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 backdrop-blur-lg bg-white/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1"
            >
              <Icon
                size={22}
                className={isActive ? "text-indigo-600" : "text-slate-400"}
              />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              >
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
