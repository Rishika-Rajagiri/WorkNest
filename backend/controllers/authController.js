const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto=require("crypto");
const { sendVerificationEmail } = require("../utils/emailService");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, bio } = req.body;

    // Check required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // genearte 6-digit otp
    const otp=crypto.randomInt(100000,1000000).toString();
    //otp expires in 5 minutes
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

     // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: skills || [],
      bio: bio || "",
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpires,
      otpLastSentAt: new Date()
    });

    res.status(201).json({
      message:  "Registration successful. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio,
        emailVerified: user.emailVerified
      }
    });

    await sendVerificationEmail(email, otp);

  } catch (error) {
    console.error("Error registering user:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
    return res.status(403).json({
    message: "Please verify your email before logging in"
      });
    } 

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // find logged in user using id from jwt
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user
    });

  } catch (error) {
    console.log("Error fetching profile:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const updateProfile=async(req,res)=>{
  try{
    const {name,skills,bio}=req.body;

    const user=await User.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        message:"Usere not found"
      });
    }
    // Update only the fields provided
    if (name) user.name = name;
    if (skills) user.skills = skills;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json({
      message:"profile updated successfully",
      user:{
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        bio: user.bio
      }
    });
  }catch(error){
    console.error("Error updating profile:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
}

//verify email
const verifyEmail=async (req,res)=>{
  try{
    const {email,otp}=req.body;

    //check required fields
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+emailVerificationOTP +emailVerificationOTPExpires");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    // Check OTP exists
    if (!user.emailVerificationOTP) {
      return res.status(400).json({
        message: "No verification OTP found"
      });
    }

    // Check OTP expiry
    if (user.emailVerificationOTPExpires < new Date()) {
      return res.status(400).json({
        message: "OTP has expired"
      });
    }

    // Check OTP
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // Verify email
    user.emailVerified = true;

    // Remove OTP after successful verification
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("Error verifying email:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
}

//resend otp
const resendOTP=async (req,res)=>{
  try{
    const {email}=req.body;

    if(!email){
       return res.status(400).json({
        message: "Email is required"
      });
    }

    //find user
    const user=await User.findOne({email});
    if(!user){
      return res.status(404).json({
        message: "User not found"
      });
    }

    //check if already verified
    if(user.emailVerified){
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    // Check resend rate limit
if (user.otpLastSentAt) {
  const timePassed = Date.now() - user.otpLastSentAt.getTime();
  const waitTime = 60 * 1000;

  if (timePassed < waitTime) {
    const remainingSeconds = Math.ceil(
      (waitTime - timePassed) / 1000
    );

    return res.status(429).json({
      message: `Please wait ${remainingSeconds} seconds before requesting another OTP`
    });
  }
}

    // Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // OTP expires in 5 minutes
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    //save new otp
    user.emailVerificationOTP=otp;
    user.emailVerificationOTPExpires=otpExpires;
    user.otpLastSentAt = new Date();

    await user.save();

    // Send new OTP email
    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send OTP"
      });
    }

    res.status(200).json({
      message: "New OTP sent successfully"
    });

  } catch (error) {
    console.error("Error resending OTP:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
}

// EXPORT
module.exports = {
  registerUser,
  loginUser,
  getProfile,updateProfile,verifyEmail,resendOTP
};