const express = require("express");
const { registerUser, loginUser, getProfile, updateProfile, verifyEmail, resendOTP } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const { registerValidation } = require("../validators/authValidator");
const validate = require("../middleware/validationMiddleware");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/register",registerValidation,validate, registerUser);
router.post("/login",loginLimiter, loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile",authMiddleware,updateProfile);
router.post("/verify-email",verifyEmail)
router.post("/resend-otp",resendOTP);

module.exports = router;