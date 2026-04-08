import { AuditLog } from "./audit.model.js";

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Admin Strict
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name email role")
      .populate("targetUser", "name email role")
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 for performance

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
