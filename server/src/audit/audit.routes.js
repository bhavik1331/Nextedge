import express from 'express';
import { getAuditLogs } from './audit.controller.js';
import { authenticateMember } from '../members/member.middleware.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Only ADMINs can view the global audit logs
router.get('/', authenticateMember, authorizeRole('ADMIN'), getAuditLogs);

export default router;
