// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },
//     phoneNumber: {
//       type: String,
//       required: true,
//     },
    
//     role: {
//       type: String,
//       enum: ["student", "admin", "security"],
//       default: "student",
//     },
//     otp: {
//       type: String,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true },
// );

// export default mongoose.model("User", userSchema);

// models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin", "security"],
      default: "student",
    },
    otp:        { type: String },
    otpExpiresAt: { type: Date },   // ← add this (you'll need it for expiry checks)
    isVerified: { type: Boolean, default: false },

    // Security-only fields (optional on the schema level)
    location: { type: String },
    shift: {
      type: String,
      enum: ["morning", "evening", "night"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);