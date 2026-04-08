import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Strict Frontend Route Access Control
export const RoleGuard = ({ requiredRole }) => {
  const { activeViewRole, user } = useAuthStore();

  // 1. If not logged in at all, kick to standard login
  if (!user) {
    return <Navigate to="/member-login" replace />;
  }

  const elevatedRoles = ['ADMIN', 'CLUB_HEAD', 'TREASURER'];

  // 2. Multi-Role Capability (array check)
  if (Array.isArray(requiredRole)) {
    // If the active view role isn't inside the authorized array
    if (!requiredRole.includes(activeViewRole)) {
      // Allow passthrough if they are inherently an elevated role
      if (!elevatedRoles.includes(user.trueRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
    return <Outlet />;
  }

  // 3. Exact Single Role match
  if (activeViewRole !== requiredRole) {
    // If targeted for MEMBER, allow any elevated role to pass through
    if (requiredRole === 'MEMBER') {
       if (!elevatedRoles.includes(user.trueRole)) {
          return <Navigate to="/unauthorized" replace />;
       }
    } else {
       // For other specific roles (like specific Admin tasks), stay strict 
       // unless they are the super ADMIN
       if (user.trueRole !== 'ADMIN') {
          return <Navigate to="/unauthorized" replace />;
       }
    }
  }

  // 4. Verification Passed -> Render Route UI Component
  return <Outlet />;
};

export default RoleGuard;
