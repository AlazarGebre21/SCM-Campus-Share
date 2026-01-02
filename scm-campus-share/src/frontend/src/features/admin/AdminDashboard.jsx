import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service";
import AnalyticsView from "../../features/admin/AnalyticsView";
import ModerationView from "../../features/admin/ModerationView";
import UsersView from "../../features/admin/UsersView";
import { BarChart3, Users, AlertTriangle, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Parallel Fetch
      const [statsData, reportsData, usersData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getReports(),
        adminService.getUsers(),
      ]);

      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Admin load error");
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (id, action) => {
    if (action === "approve") await adminService.approveReport(id);
    else await adminService.rejectReport(id);
    // Optimistic Update
    setReports(reports.filter((r) => r.id !== id));
  };

  const handleBanToggle = async (userId, shouldBan) => {
    if (shouldBan) await adminService.banUser(userId);
    else await adminService.unbanUser(userId);

    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: shouldBan ? "banned" : "active" } : u
      )
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Platform overview and management.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={BarChart3}
          label="Overview"
        />
        <TabButton
          active={activeTab === "reports"}
          onClick={() => setActiveTab("reports")}
          icon={AlertTriangle}
          label={`Reports (${reports.length})`}
        />
        <TabButton
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
          icon={Users}
          label="Users"
        />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && <AnalyticsView stats={stats} />}
        {activeTab === "reports" && (
          <ModerationView reports={reports} onAction={handleReportAction} />
        )}
        {activeTab === "users" && (
          <UsersView users={users} onBanToggle={handleBanToggle} />
        )}
      </div>
    </div>
  );
};

// Simple Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
      active
        ? "bg-white text-blue-600 shadow-sm"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
    }`}
  >
    <Icon size={18} /> {label}
  </button>
);

export default AdminDashboard;
