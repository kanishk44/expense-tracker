const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config();

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordRequest = await ForgotPasswordRequest.create({
      userId: user._id,
    });

    const sentFrom = new Sender(
      "expense-tracker@kanishkcodes.biz",
      "Expense Tracker"
    );
    const recipients = [new Recipient(user.email, user.name)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Password Reset Request")
      .setHtml(
        `
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${process.env.APP_URL}/password/resetpassword/${passwordRequest._id}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will only work once and expires after use.</p>
      `
      )
      .setText("Reset your password by clicking the link in this email.");

    await mailerSend.email.send(emailParams);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Error in forgot password:", err);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

exports.getResetPasswordPage = async (req, res) => {
  try {
    const { id } = req.params;

    const passwordRequest = await ForgotPasswordRequest.findOne({
      _id: id,
      isActive: true,
    }).populate("userId");

    if (!passwordRequest) {
      return res.status(404).send(`
        <html>
          <body>
            <h1>Invalid or Expired Link</h1>
            <p>This password reset link is invalid or has already been used.</p>
            <p><a href="/login">Return to Login</a></p>
          </body>
        </html>
      `);
    }

    res.sendFile(path.join(__dirname, "..", "public", "reset-password.html"));
  } catch (err) {
    console.error("Error loading reset page:", err);
    res.status(500).send("Error loading reset password page");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const passwordRequest = await ForgotPasswordRequest.findOne({
      _id: id,
      isActive: true,
    }).populate("userId");

    if (!passwordRequest) {
      return res.status(400).json({
        error: "Invalid or expired reset link",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(passwordRequest.userId._id, {
      password: hashedPassword,
    });

    await ForgotPasswordRequest.findByIdAndUpdate(id, { isActive: false });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
