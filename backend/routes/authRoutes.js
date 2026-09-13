const express = require("express");
const { registerUser, loginUser, getProfile, updateProfile, verifyEmail, resendOTP } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile",authMiddleware,updateProfile);
router.post("/verify-email",verifyEmail)
router.post("/resend-otp",resendOTP);

module.exports = router;