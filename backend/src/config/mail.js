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
