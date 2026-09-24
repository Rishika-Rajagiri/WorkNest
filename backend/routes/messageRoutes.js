const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getMessagesByContract } = require("../controllers/messageController");

router.get("/:contractId", authMiddleware, getMessagesByContract);

module.exports = router;