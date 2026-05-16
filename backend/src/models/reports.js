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
      enum: [
    "Harassment",
    "Emergency",
    "General Complaint",
    "Ragging",
    "Mental Stress",
    "Theft",
    "Violence",
  ],
      default: "ragging",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    riskScore: {
  type: Number,
  default: 0,
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
