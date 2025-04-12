const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
const cors = require('cors');

app.use(cors({
  origin: '*'
}));



const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const { token } = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "officialelsa552@gmail.com",
      accessToken: token,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: "Elsa Official <officialelsa552@gmail.com>",
      to,
      subject,
      text,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
      },
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.response);
    res.status(200).send("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).send("Failed to send email.");
  }
});

app.get("/", (req, res) => {
  res.send("Email API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
