import React from "react";
import { Navigate } from "react-router-dom";

export default function RoleProtectedAdminRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem("oqs_admin_token");
  const role = localStorage.getItem("oqs_admin_role");

  // not logged in
  if (!token) return <Navigate to="/admin/login" replace />;

  // logged in but role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // allowed
  return children;
}