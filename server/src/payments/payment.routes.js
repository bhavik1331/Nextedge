import express from 'express';
import {
  submitManualPayment,
  getMemberPayments,
  getAllPayments,
  approvePayment,
  rejectPayment
} from './payment.controller.js';
import upload from '../events/upload.js';
import { authenticateMember } from '../members/member.middleware.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import { handleStripeWebhook } from './paymentService.js';

const router = express.Router();

// Webhook for standard Stripe implementation (needs raw body, so place before raw parsing if necessary)
router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

// Member Routes (Accessible by Anyone logged in so they can pay fees)
router.post('/manual', authenticateMember, upload.fields([{ name: 'proofImage', maxCount: 1 }]), submitManualPayment);
router.get('/member', authenticateMember, getMemberPayments);

// Admin / Treasurer Financial Routes
// First ensure they are authenticated, then enforce RBAC
const financialGuard = [authenticateMember, authorizeRole('ADMIN', 'TREASURER')];

router.get('/admin', ...financialGuard, getAllPayments);
router.put('/:id/approve', ...financialGuard, approvePayment);
router.put('/:id/reject', ...financialGuard, rejectPayment);

export default router;
