import SOS from "../models/sos.js";
import User from "../models/user.js";
import { sendNotificationEmail } from "../config/mail.js";



// Create SOS Alert
const createSOS = async (req, res) => {
console.log("Received SOS Request:", req.body);
  try {
    const { latitude, longitude, message } = req.body;


    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    const existingReport = await SOS.findOne({
      userId: req.user.id,
      latitude,
      longitude,
      message,
      createdAt: {
        $gte: new Date(Date.now() - 10 * 60 * 1000),
      },
    });

    if (existingReport) {
      return res.status(400).json({
        message:
          "Duplicate incident detected. Please avoid submitting the same report repeatedly.",
      });
    }

    const sos = await SOS.create({
      user: req.user.id,
      latitude,
      longitude,
      message,
    });
    console.log("SOS Created:", sos);


    // Fetch admin for sending email




    const admin = await User.findOne({
      role: "admin",
    }).select("email");

    // Fetch security members
    const securityUsers = await User.find({
      role: "security",
    }).select("email");

    // Extract emails
    const securityEmails = securityUsers.map((user) => user.email);

    // Combine emails
    const recipients = [admin?.email, ...securityEmails].filter(Boolean);

    // Send emergency email
    const emailResult = await sendNotificationEmail(
      recipients.join(","),

      "🚨 Emergency SOS Alert",

      `
    <h1>Emergency SOS Triggered</h1>

    <p><strong>User:</strong> ${req.user.id}</p>

    <p><strong>Latitude:</strong> ${latitude}</p>

    <p><strong>Longitude:</strong> ${longitude}</p>

    <p><strong>Message:</strong> ${message}</p>
  `,
    );
if(!emailResult){ 
    res.status(500).json({
      success: false,
      message: "Failed to send SOS notification email",
    });
    console.error("Failed to send SOS notification email");
}
else{
res.status(201).json({
      success: true,
      message: "SOS Alert Sent Successfully",
      sos,
    });
}
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All SOS Alerts
const getAllSOS = async (req, res) => {
  try {
    const alerts = await SOS.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update SOS Status
const updateSOSStatus = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: "SOS Alert not found",
      });
    }

    sos.status = req.body.status || sos.status;

    await sos.save();

    res.status(200).json({
      success: true,
      message: "SOS Status Updated",
      sos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createSOS, getAllSOS, updateSOSStatus };
