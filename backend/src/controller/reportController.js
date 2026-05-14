import Report from "../models/reports.js";
import { sendNotificationEmail } from "../config/mail.js";
// 🤖 Call Claude API to determine severity
const analyzeSeverity = async (title, description, category) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a campus safety AI assistant. 
Your job is to analyze incident reports and assign a severity level.
Severity levels:
- Low: Minor issues, no immediate danger (e.g. petty theft, mild verbal dispute)
- Medium: Moderate concern, needs attention soon (e.g. repeated harassment, threatening behavior)
- High: Urgent, immediate danger or serious harm (e.g. physical violence, medical emergency, serious ragging)
Respond ONLY with a valid JSON object in this exact format, nothing else:
{"severity": "Low"} or {"severity": "Medium"} or {"severity": "High"}`,
      messages: [
        {
          role: "user",
          content: `Analyze this campus incident:
Category: ${category}
Title: ${title}
Description: ${description}
Assign the correct severity level.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim();
  const parsed = JSON.parse(text);

  if (!["Low", "Medium", "High"].includes(parsed.severity)) {
    return "Medium"; // safe fallback
  }
  return parsed.severity;
};

// ✅ Report an incident
export const ReportController = async (req, res) => {
  try {
    const { title, description, category, location, isAnonymous } = req.body;

    // 1. Presence check
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingReport = await Report.findOne({
      reportedBy: req.user.id,
      title,
      description,
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

    // 2. AI assigns severity
    let severity = "Medium"; // default fallback
    try {
      severity = await analyzeSeverity(title, description, category);
    } catch (aiError) {
      console.error(
        "AI severity analysis failed, using default:",
        aiError.message,
      );
    }

    // 3. Create incident
    const incident = await Report.create({
      // ✅ fixed: Report not report
      title,
      description,
      category,
      severity, // ✅ AI assigned
      location,
      isAnonymous: isAnonymous || false,
      reportedBy: isAnonymous ? null : req.user.id,
    });

    // Fetch admin
    const admin = await User.findOne({
      role: "admin",
    }).select("email");

    // Fetch all security members
    const securityUsers = await User.find({
      role: "security",
    }).select("email");

    // Extract emails
    const securityEmails = securityUsers.map((user) => user.email);

    // Combine emails
    const recipients = [admin?.email, ...securityEmails].filter(Boolean);

    // Send notification
    const emailResult = await sendNotificationEmail(
      recipients.join(","),

      "New Incident Report",

      `
    <h2>New Incident Report Submitted</h2>

    <p><strong>Title:</strong> ${title}</p>

    <p><strong>Category:</strong> ${category}</p>

    <p><strong>Severity:</strong> ${severity}</p>

    <p><strong>Location:</strong> ${location}</p>

    <p><strong>Description:</strong> ${description}</p>
  `,
    );

    if (!emailResult) {
      console.error("Failed to send incident notification email");
      return res.status(500).json({
        success: false,
        message: "Failed to send incident notification email",
      });
    }

    res.status(201).json({
      success: true,
      message: "Incident reported successfully",
      incident,
    });
  } catch (error) {
    console.error(
      `[ReportController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get all incidents (admin sees all, student sees own)
export const GetAllIncidentsController = async (req, res) => {
  try {
    const { category, severity, status } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    if (req.user.role !== "admin") {
      filter.reportedBy = req.user.id;
    }

    const incidents = await Report.find(filter) // ✅ fixed: Report not report
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: incidents.length, incidents });
  } catch (error) {
    console.error(
      `[GetAllIncidentsController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Get single incident
export const GetIncidentByIdController = async (req, res) => {
  try {
    const incident = await Report.findById(req.params.id) // ✅ fixed: Report not Incident
      .populate("reportedBy", "name email");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (
      req.user.role !== "admin" &&
      incident.reportedBy?._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, incident });
  } catch (error) {
    console.error(
      `[GetIncidentByIdController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update incident status (admin only)
export const UpdateIncidentStatusController = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Open", "Investigating", "Resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const incident = await Report.findByIdAndUpdate(
      // ✅ fixed: Report not Incident
      req.params.id,
      { status },
      { new: true },
    );

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    res.status(200).json({ success: true, message: "Status updated", incident });
  } catch (error) {
    console.error(
      `[UpdateIncidentStatusController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Delete incident (admin only)
export const DeleteIncidentController = async (req, res) => {
  try {
    const incident = await Report.findByIdAndDelete(req.params.id); // ✅ fixed: Report not Incident

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    res.status(200).json({ success: true, message: "Incident deleted successfully" });
  } catch (error) {
    console.error(
      `[DeleteIncidentController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
