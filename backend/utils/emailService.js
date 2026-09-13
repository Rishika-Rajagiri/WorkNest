const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `WorkNest <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your WorkNest email",
      html: `
        <h2>Welcome to WorkNest! 🚀</h2>

        <p>Your email verification OTP is:</p>

        <h1>${otp}</h1>

        <p>
          This OTP will expire in <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not create a WorkNest account,
          you can ignore this email.
        </p>
      `
    });

    console.log("Verification email sent to:", email);

    return true;

  } catch (error) {
    console.error("Email sending error:", error);

    return false;
  }
};

module.exports = { sendVerificationEmail };