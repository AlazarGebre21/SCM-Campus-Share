import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    student_id: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(formData);
      navigate("/app");
    } catch (err) {
      const rawError = err.response?.data?.error || "";

      // Friendly Translation
      if (rawError.includes("23505")) {
        setError("This email is already registered. Try logging in!");
      } else if (rawError.includes("Password") && rawError.includes("min")) {
        setError("Password is too short (minimum 8 characters).");
      } else {
        setError("Registration failed. Please check your information.");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 px-4 py-12">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg">
            <span className="text-2xl font-bold">C</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Join the Campus Share community
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Row for First and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">
                First Name
              </label>
              <input
                name="first_name"
                required
                onChange={handleChange}
                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">
                Last Name
              </label>
              <input
                name="last_name"
                required
                onChange={handleChange}
                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">
              Student Email
            </label>
            <input
              name="email"
              type="email"
              required
              onChange={handleChange}
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
              placeholder="student@uni.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              onChange={handleChange}
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 mb-1">
              Student ID
            </label>
            <input
              name="student_id"
              onChange={handleChange}
              className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none"
              placeholder="U12345678"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500 font-medium">
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            className="font-bold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
