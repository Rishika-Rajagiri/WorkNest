const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    delivered: {
      type: Boolean,
      default: false
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

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;