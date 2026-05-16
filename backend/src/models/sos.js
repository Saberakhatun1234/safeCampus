import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      default: "Emergency Alert Triggered",
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Open", "Investigating", "Resolved"],
      default: "Open",
    },
  },
  { timestamps: true },
);

export default mongoose.model("SOS", sosSchema);
