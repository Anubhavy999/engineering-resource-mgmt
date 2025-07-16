import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, role, name, email: userEmail, id } = res.data;

      // Save all needed values to sessionStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("name", name);
      sessionStorage.setItem("email", userEmail); // used in UserDropdown
      sessionStorage.setItem("id", id); // <-- add this line

      // Navigate based on role
      if (role === "MANAGER") {
        navigate("/manager");
      } else if (role === "ENGINEER") {
        navigate("/engineer");
      } else {
        setError("Invalid user role");
      }

      console.log("Login response:", res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-gradient-to-br from-white via-blue-50 to-purple-50 p-10 shadow-2xl rounded-3xl w-full max-w-sm transition-all duration-300 border-t-8 border-blue-400 hover:shadow-[0_12px_36px_0_rgba(59,130,246,0.18)] hover:scale-105 hover:border-blue-600"
      >
        <h2 className="text-xl font-bold mb-6 text-center text-blue-700">
          Sign In
        </h2>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
