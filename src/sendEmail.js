const nodemailer = require("nodemailer");
const {
  SMTP_EMAIL,
  SMTP_PASSWORD,
  EMAIL_RECIPIENT,
} = require("./config/jiraConfig");

async function sendEmail(htmlContent) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Developers <${SMTP_EMAIL}>`,
    to: EMAIL_RECIPIENT,
    subject: "Daily Project Update for CiViQ",
    html: htmlContent,
  };
  console.log(EMAIL_RECIPIENT);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    // Log error details for debugging
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
  }
}

module.exports = sendEmail;
