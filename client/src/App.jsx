import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

// Route Guard
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<SignIn />} />

        {/* MANAGER routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/add-engineer" element={<AddEngineer />} />
        </Route>

        {/* ENGINEER routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ENGINEER"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/engineer" element={<EngineerDashboard />} />
        </Route>

        {/* Shared between MANAGER + ENGINEER */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["MANAGER", "ENGINEER"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/projects" element={<Projects />} />
          <Route path="/assignments" element={<Assignments />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
