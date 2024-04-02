const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
var route = express.Router();
const twilio = require("twilio");

const app = express();
const port = 3002;

app.use(bodyParser.json());

const accountSid = "****";
const authToken = "****";

function generateOTP(length) {
  const charset = "0123456789"; // You can include additional characters if needed
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    otp += charset[randomIndex];
  }
  return otp;
}

// Middleware function to generate OTP
function generateOTPMiddleware(req, res, next) {
  const otpLength = 6; // Define the length of OTP
  const otp = generateOTP(otpLength);
  req["generatedOTP"] = otp; // Attach the generated OTP to the request object
  next(); // Call the next middleware or route handler
}
app.post("/sendMsg", generateOTPMiddleware, async (req, res) => {
  const { phoneNumber, message } = req.body;
  //   message = message + req.generatedOTP;
  console.log(req.generatedOTP);
  console.log(req.body);
  const generatedOTP = req.generatedOTP;
  const myNumber = "+12512548874";

  try {
    const client = require("twilio")(accountSid, authToken);

    client.messages
      .create({
        body: message + " Your OTP is: " + generatedOTP,
        from: myNumber,
        to: phoneNumber,
      })
      .then((verification) => {
        console.log("Verification SID:", verification.sid);
        res
          .status(200)
          .json({ success: true, message: "SMS sent successfully" });
      })
      .catch((error) => {
        console.error("Error sending SMS:", error);
        res.status(500).json({ success: false, error: "Error sending SMS" });
      });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ success: false, error: "Error sending SMS" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
