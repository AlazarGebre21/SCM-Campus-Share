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
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="first_name"
              placeholder="First Name"
              required
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
            <input
              name="last_name"
              placeholder="Last Name"
              required
              onChange={handleChange}
              className="p-2 border rounded w-full"
            />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email (student@uni.edu)"
            required
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />
          <input
            name="student_id"
            placeholder="Student ID (Optional)"
            onChange={handleChange}
            className="p-2 border rounded w-full"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Register
          </button>
        </form>
        <div className="text-center text-sm">
          <Link to="/login" className="text-blue-600">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
