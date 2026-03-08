import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkerLogin from "./pages/WorkerLogin";
import AdminLogin from "./pages/AdminLogin";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import WorkerDashboard from "./pages/WorkerDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import ProfileSettings from "./pages/ProfileSettings";
import PrivateRoute from "./components/PrivateRoute";
import OfflineIndicator from "./components/OfflineIndicator";
import SyncManager from "./components/SyncManager";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";

function App() {

  // Handle Google OAuth redirect token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // reload so AuthContext re-checks the user
      window.location.reload();
    }
  }, []);

  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
          },
        }}
      />

      <Router>
        <OfflineIndicator />
        <SyncManager onSyncComplete={() => window.location.reload()} />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:email" element={<VerifyEmail />} />
          <Route path="/worker-login" element={<WorkerLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected: Citizen */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["citizen"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Protected: Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Protected: Admin Analytics */}
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />

          {/* Protected: Worker */}
          <Route
            path="/worker"
            element={
              <PrivateRoute roles={["worker"]}>
                <WorkerDashboard />
              </PrivateRoute>
            }
          />

          {/* Worker password change */}
          <Route
            path="/change-password"
            element={
              <PrivateRoute roles={["worker"]}>
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute roles={["citizen", "worker", "admin"]}>
                <ProfileSettings />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;