const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const moment = require("moment");

const app = express();
const PORT = process.env.PORT || 3002;

// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Twilio client
const accountSid = "****";
const authToken = "****";
const twilioClient = twilio(accountSid, authToken);

// Mock database to store OTPs
const otpDB = {};

// Route to handle forgot password request
app.post("/forgot-password", (req, res) => {
  const { phoneNumber } = req.body;
  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  // Store OTP in database
  otpDB[phoneNumber] = {
    otp: otp.toString(),
    timestamp: moment().toISOString(),
  };
  // Send OTP via SMS
  twilioClient.messages
    .create({
      body: `Your OTP for password reset is: ${otp}`,
      from: "+12512548874",
      to: phoneNumber, // Replace with user's phone number or phoneNumber
    })
    .then(() => {
      res.send("OTP sent successfully");
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      res.status(500).send("Error sending OTP");
    });
});

// Route to handle OTP verification and password reset
app.post("/reset-password", (req, res) => {
  const { phoneNumber, otp, newPassword } = req.body;
  // Check if OTP exists in the database
  if (!otpDB[phoneNumber] || otpDB[phoneNumber].otp !== otp) {
    return res.status(400).send("Invalid OTP");
  }
  // Check if OTP is expired (e.g., expire after 5 minutes)
  const timestamp = moment(otpDB[phoneNumber].timestamp);
  if (moment().diff(timestamp, "minutes") > 5) {
    delete otpDB[phoneNumber];
    return res.status(400).send("OTP expired");
  }
  // Reset password (Update password in database)
  // Your code to update the password goes here
  // For demonstration, we're just printing the new password
  console.log(`New password for ${phoneNumber}: ${newPassword}`);
  // Remove OTP from the database
  delete otpDB[phoneNumber];
  res.send("Password reset successfully");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
