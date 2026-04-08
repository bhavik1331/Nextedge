/**
 * Strict Middleware enforcing hierarchy or specific roles
 * Assumes req.member is populated by authenticateMember middleware
 * 
 * Roles: 'ADMIN', 'CLUB_HEAD', 'TREASURER', 'MEMBER'
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Standard role defaults to MEMBER if not set
    const userRole = req.member?.role || 'MEMBER';

    // Global Admin Override: An ADMIN can access anything natively if they want
    // But typically we enforce specific exact roles for strict access control
    if (userRole === 'ADMIN') {
      return next(); 
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        message: "Forbidden. You do not hold the required clearance to perform this action." 
      });
    }

    next();
  };
};
