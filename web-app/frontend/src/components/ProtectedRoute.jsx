import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const roleId = localStorage.getItem("role_id"); // numeric string "1", "2", "3"

  // If no token → not logged in
  if (!token || !roleId) {
    return <Navigate to="/login" replace />; // "/" is your login route
  }

  // Convert roleId to number for comparison
  const numericRoleId = Number(roleId);

  // Check if user's role is allowed
  if (!allowedRoles.includes(numericRoleId)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
