import User from "../models/user.js";
import bcrypt from "bcryptjs";
export async function getUserProfileController(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching user profile" });
  }
}

export async function getAllStudentsController(req, res) {
  try {
    const students = await User.find({ role: "student" }).select("-password");

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching students",
    });
  }
}

export async function deleteStudentController(req, res) {
  try {
    const { id } = req.params;

    const student = await User.findOneAndDelete({ _id: id, role: "student" });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting student",
    });
  }
}

// GET all security personnel
export async function getAllSecurityController(req, res) {
  try {
    const security = await User.find({ role: "security" }).select("-password");
    res.status(200).json({ success: true, security });
  } catch (error) {
    console.error("getAllSecurity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH toggle active/inactive
export async function toggleSecurityStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const guard = await User.findOneAndUpdate(
      { _id: id, role: "security" },
      { status },
      { new: true },
    ).select("-password");

    if (!guard) {
      return res
        .status(404)
        .json({ success: false, message: "Security personnel not found" });
    }

    res.status(200).json({ success: true, guard });
  } catch (error) {
    console.error("toggleSecurityStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE security person
export async function deleteSecurityController(req, res) {
  try {
    const { id } = req.params;
    const guard = await User.findOneAndDelete({ _id: id, role: "security" });

    if (!guard) {
      return res
        .status(404)
        .json({ success: false, message: "Security personnel not found" });
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("deleteSecurityController error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

