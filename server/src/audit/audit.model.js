import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true // e.g., 'ROLE_UPDATE', 'MEMBER_CREATED'
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member',
    required: true
  },
  targetUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member' 
  },
  details: { 
    type: mongoose.Schema.Types.Mixed 
  },
}, { timestamps: true });

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
