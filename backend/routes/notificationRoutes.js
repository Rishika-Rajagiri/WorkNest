const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,markNotificationAsRead,deleteNotification
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);

router.patch(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;