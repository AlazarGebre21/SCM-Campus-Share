import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
      navigate("/app");
    } catch (err) {
      if (!err.response) {
        setError("Server is offline. Please make sure the backend is running.");
      } else {
        setError(err.response?.data?.error || "Invalid email or password");
      }
    }
  };

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 px-4">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg">
              <span className="text-2xl font-bold">C</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Campus Share: Your Academic Hub
            </p>
          </div>
  
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3">
               <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
               {error}
            </div>
          )}
  
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">Password</label>
              <input
                type="password"
                required
                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
  
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95"
            >
              Sign In
            </button>
          </form>
  
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 font-medium">New here? </span>
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  };

export default Login;
