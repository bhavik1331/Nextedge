import { verifyAccessToken } from "../utils/jwt.js";
import Member from "./member.model.js";
import Admin from "../Admin/admin.model.js";

/**
 * Verify JWT and authenticate member or admin natively
 * Sets req.member = { id, email, role }.
 */
export const authenticateMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    const decoded = verifyAccessToken(token);

    // Hybrid Check: If not found in Member database, check the legacy Admin database
    let member = await Member.findById(decoded.id);
    if (!member) {
      member = await Admin.findById(decoded.id);
    }
    
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }
    
    if (!member.isActive) {
      return res.status(403).json({
        success: false,
        message: "Member account is deactivated.",
      });
    }

    req.member = {
      id: member._id,
      email: member.email || member.username,
      role: member.role ? member.role.toUpperCase() : 'MEMBER',
    };
    next();
  } catch (error) {
    if (error.message === "Token has expired") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }
    if (error.message === "Invalid token") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Access denied.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};
