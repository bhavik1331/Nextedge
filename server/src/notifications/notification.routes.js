import express from 'express';
import { sendSingleNotification, sendBulkNotification } from './notification.controller.js';
// Add admin protecting middleware here if you have it
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to send notification to a single specific user
// Protect these routes as per your auth setup (e.g., router.post('/send', protect, admin, sendSingleNotification);)
router.post('/send', sendSingleNotification);

// Route to send bulk notifications to all members
router.post('/send-bulk', sendBulkNotification);

export default router;
