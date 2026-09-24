const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  type,
  message,
  relatedId
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      relatedId
    });

    return notification;

  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

module.exports = createNotification;