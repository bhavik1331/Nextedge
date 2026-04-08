import express from 'express';
import {
  generateCertificate,
  generateReceipt,
  generateAppointment
} from './document.controller.js';
import { authenticateMember } from '../members/member.middleware.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Document generation routes (Admins and Treasurers can generate docs)
router.use(authenticateMember, authorizeRole('ADMIN', 'TREASURER', 'CLUB_HEAD'));

router.get('/certificate/:memberId', generateCertificate);
router.get('/receipt/:paymentId', generateReceipt);
router.get('/appointment/:memberId', generateAppointment);

export default router;
