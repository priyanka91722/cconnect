/**
 * Notification Routes
 */

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// Get current user's notifications
router.get("/", notificationController.getNotifications);

// Mark a notification as read
router.put("/:id/read", notificationController.markNotificationAsRead);

module.exports = router;
