import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";

// Auth
import SignIn from "./pages/AuthPages/SignIn";

// Pages
import ManagerDashboard from "./pages/Dashboard/ManagerDashboard";
import EngineerDashboard from "./pages/Dashboard/EngineerDashboard";
import AddEngineer from "./pages/AddEngineer";
import Projects from "./pages/Projects";
import Assignments from "./pages/Assignments";
import EngineerProjects from "./pages/EngineerProjects";
import EngineerAssignments from "./pages/EngineerAssignments";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";

// Route Guard
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Login */}
        <Route path="/" element={<SignIn />} />

        {/* Profile route for all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["MANAGER", "ENGINEER", "SUPER-ADMIN"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserProfile />} />
        </Route>

        {/* Manager-only sections */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/add-engineer" element={<AddEngineer />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/assignments" element={<Assignments />} />
        </Route>

        {/* Engineer-only sections */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ENGINEER"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/engineer" element={<EngineerDashboard />} />
          <Route path="/engineer-projects" element={<EngineerProjects />} />
          <Route path="/engineer-assignments" element={<EngineerAssignments />} />
        </Route>

        {/* Catch‑all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
