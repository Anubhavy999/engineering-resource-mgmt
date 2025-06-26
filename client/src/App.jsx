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
        {/* Public Login Route */}
        <Route path="/" element={<SignIn />} />

        {/* Protected Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AppLayout>
                <ManagerDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/engineer"
          element={
            <ProtectedRoute allowedRoles={["ENGINEER"]}>
              <AppLayout>
                <EngineerDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-engineer"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <AppLayout>
                <AddEngineer />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["MANAGER", "ENGINEER"]}>
              <AppLayout>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["MANAGER", "ENGINEER"]}>
              <AppLayout>
                <Assignments />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
