const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
  type: String,
  required: true
},
message: {
  type: String,
  required: true,
  trim: true
},
relatedId: {
  type: mongoose.Schema.Types.ObjectId
},
read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;