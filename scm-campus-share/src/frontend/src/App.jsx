import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadResource from "./pages/UploadResource";
import ResourceDetails from "./pages/ResourceDetails";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import LandingPage from "./features/landing/LandingPage.jsx";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<UploadResource />} />
              <Route path="resource/:id" element={<ResourceDetails />} />
              <Route path="profile" element={<Profile />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/app" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
