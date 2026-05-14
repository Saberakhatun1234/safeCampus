import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Ragging Incident",
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["theft", "violence", "ragging", "harassment", "other"],
      default: "ragging",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved"],
      default: "pending",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);
