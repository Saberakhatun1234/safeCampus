import nodemailer from "nodemailer";

console.log("Mail configuration loaded with host:");
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify mail configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Error occurred while verifying mail configuration:", error);
  } else {
    console.log("Mail configuration verified successfully.");
  }
});
// Function to send email for useremail verification
export async function sendMail(email, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"SafeCampus" <${process.env.MAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Message sent:", info.messageId);

    return true;
  } catch (err) {
    console.error("Error while sending mail:", err);

    return false;
  }
}

//send mail for sos alert and report alert

export const sendNotificationEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SafeCampus" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");

    return true;
  } catch (error) {
    console.log("Email Error:", error);

    return false;
  }
};