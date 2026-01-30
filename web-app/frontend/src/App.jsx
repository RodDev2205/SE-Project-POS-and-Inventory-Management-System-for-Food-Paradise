import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminOwnerDashboard from "./pages/AdminDashboardPage";
import POS from "./pages/POS";
import SuperAdminDashboard from "./pages/OwnerDashboard";
import DashboardPage from "./pages/OwnerDashboardPage";
import ManagementPage from "./pages/ManagementPage";
import ReportPage from "./pages/ReportPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* OWNER ROUTE — allowedRoles example: 2 = admin, 3 = superadmin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <AdminOwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="management" element={<ManagementPage />} />
          <Route path="reports" element={<ReportPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<SettingsPage />} /> {/* Only superadmin can see this */}
        </Route>
        
        {/* CASHIER ROUTE — role_id = 1 */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <POS />
            </ProtectedRoute>
          }
        />

        {/* OTHER PAGES (only cashiers allowed?) */}
        <Route
          path="/records"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <POS />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["cashier"]}>
              <POS />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
