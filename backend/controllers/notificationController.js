const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        read: true
      },
      {
        returnDocument: "after"
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting notification:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  getNotifications,markNotificationAsRead,deleteNotification
};