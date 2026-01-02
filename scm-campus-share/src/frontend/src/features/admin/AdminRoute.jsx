import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Loader2 } from "lucide-react";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  // 1. Wait for Auth Check to finish
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // 2. Security Check
  // Ensure user exists AND has specific 'admin' role
  if (user && user.role === "admin") {
    return <Outlet />;
  }

  // 3. Unauthorized Handling
  // If not admin, redirect to safe Student Dashboard
  return <Navigate to="/" replace />;
};

export default AdminRoute;
