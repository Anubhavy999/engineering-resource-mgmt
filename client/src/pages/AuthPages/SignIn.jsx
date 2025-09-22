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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100">
      {/* Decorative background blobs */}
      <span className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_10px_50px_-12px_rgba(46,104,229,0.35)] ring-1 ring-white/70 transition-all duration-300 hover:shadow-[0_16px_60px_-10px_rgba(46,104,229,0.45)] hover:-translate-y-0.5"
      >
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
            <span className="font-semibold">ER</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back</h2>
          <p className="mt-1 text-slate-500 text-sm">Sign in to continue to ERM</p>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/90 placeholder-slate-400 text-slate-800 shadow-inner focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/90 placeholder-slate-400 text-slate-800 shadow-inner focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-white font-semibold shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/80 px-3 text-xs font-medium text-slate-500">Or use demo</span>
        </div>

        {/* Demo credentials for quick access */}
        <div className="text-sm text-slate-700">
          <div className="p-4 rounded-xl border border-slate-200 bg-white/70">
            <p className="font-semibold text-slate-800 mb-2 text-center">Demo Credentials</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-50 text-blue-700 w-7 h-7 text-xs font-bold ring-1 ring-blue-200">M</span>
                <div>
                  <p className="font-medium text-slate-800">Manager</p>
                  <p className="text-slate-600">Email: <span className="font-mono">shyam@gmail.com</span></p>
                  <p className="text-slate-600">Password: <span className="font-mono">manager123</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 inline-flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 w-7 h-7 text-xs font-bold ring-1 ring-indigo-200">E</span>
                <div>
                  <p className="font-medium text-slate-800">Engineer</p>
                  <p className="text-slate-600">Email: <span className="font-mono">bob@gmail.com</span></p>
                  <p className="text-slate-600">Password: <span className="font-mono">bob123</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
