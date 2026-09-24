const Message = require("../models/Message");

const getMessagesByContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const messages = await Message.find({
      contract: contractId
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages
    });

  } catch (error) {
    console.error("Error fetching messages:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  getMessagesByContract
};