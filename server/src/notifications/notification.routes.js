import express from 'express';
import { sendSingleNotification, sendBulkNotification, getMyNotifications } from './notification.controller.js';
import { authenticateMember } from '../members/member.middleware.js';

const router = express.Router();

// Route to get notifications for the logged-in member
router.get('/my-notifications', authenticateMember, getMyNotifications);

// Admin-facing routes
router.post('/send', sendSingleNotification);
router.post('/send-bulk', sendBulkNotification);

export default router;
