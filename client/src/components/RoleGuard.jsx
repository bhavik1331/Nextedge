import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Strict Frontend Route Access Control
export const RoleGuard = ({ requiredRole, deniedRedirectByRole }) => {
  const { user } = useAuthStore();

  // 1. If not logged in at all, kick to standard login
  if (!user) {
    return <Navigate to="/member-login" replace />;
  }

  const effectiveRole = user?.trueRole || user?.role;
  const deniedRedirect =
    deniedRedirectByRole?.[effectiveRole] ||
    deniedRedirectByRole?.default ||
    "/unauthorized";

  // 2. Multi-Role Capability (array check)
  if (Array.isArray(requiredRole)) {
    // Strict allow-list: only explicitly listed roles can pass
    if (!requiredRole.includes(effectiveRole)) {
      return <Navigate to={deniedRedirect} replace />;
    }
    return <Outlet />;
  }

  // 3. Exact Single Role match
  if (effectiveRole !== requiredRole) {
    return <Navigate to={deniedRedirect} replace />;
  }

  // 4. Verification Passed -> Render Route UI Component
  return <Outlet />;
};

export default RoleGuard;
