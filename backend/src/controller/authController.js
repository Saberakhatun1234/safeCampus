import crypto from "crypto";
import User from "./../models/user.js";
import { sendMail } from "../config/mail.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../config/generateToken.js";






export const createUserWithOtp = async ({
  name,
  email,
  password,
  phoneNumber,
  role = "student",
  extraFields = {},
  emailSubject,
  emailHtml,
}) => {
  // 1. Duplicate check
  const exists = await User.findOne({ email });

  if (exists) {
    throw Object.assign(new Error("User already exists."), {
      status: 400,
    });
  }

  // 2. Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
    otp,
    otpExpiresAt,
    isVerified: false,
    ...extraFields,
  });

  // 5. Generate final email HTML
  let finalHtml;

  if (typeof emailHtml === "function") {
    finalHtml = emailHtml(otp);
  } else {
    finalHtml = emailHtml || defaultOtpHtml(name, otp);
  }

  console.log("Generated OTP:", otp);
  console.log("Final Email HTML:", finalHtml);

  // 6. Send email
  const sent = await sendMail(
    email,
    emailSubject || "SafeCampus - Verify your account",
    finalHtml,
  );

  // 7. Rollback if email fails
  if (!sent) {
    await User.deleteOne({ _id: user._id });

    throw Object.assign(new Error("Registration failed. Please try again."), {
      status: 500,
    });
  }

  return user;
};

// Default OTP email template (used for students)
const defaultOtpHtml = (name, otp) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#1d4ed8">Hello ${name}</h2>

    <p>Your OTP for email verification is:</p>

    <div style="
      font-size:2rem;
      font-weight:bold;
      letter-spacing:8px;
      color:#1d4ed8;
      text-align:center;
      padding:16px 0;
    ">
      ${otp}
    </div>

    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
  </div>
`;
// controllers/student.controller.js


export const UserRegisterController = async (req, res) => {
  console.log("Received registration request:", req.body);
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validation (keep exactly as you had it)
    if (!name || !email || !password || !phoneNumber)
      return res.status(400).json({ message: "All fields are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber))
      return res.status(400).json({ message: "Invalid phone number format" });

    // Reuse core — role defaults to "student"
    await createUserWithOtp({ name, email, password, phoneNumber });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error(`[UserRegisterController] ${new Date().toISOString()}:`, err.message);
    res.status(err.status ?? 500).json({ message: err.message || "Internal Server Error" });
  }
};

//check token
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// User Registration with OTP Verification
// export const UserRegisterController = async (req, res) => {
//   console.log("Received registration request:", req.body); // Debug log
//   try {
//     const { name, email, password, phoneNumber } = req.body;

//     // 1. Presence check
//     if (!name || !email || !password || !phoneNumber) {
//       return res.status(400).json({
//         message: "All fields are required",
//       });
//     }

//     // 2. Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         message: "Invalid email format",
//       });
//     }

//     // 3. Password strength check
//     if (password.length < 6) {
//       return res.status(400).json({
//         message: "Password must be at least 6 characters",
//       });
//     }

//     // 4. Phone number format validation (10-15 digits)
//     const phoneRegex = /^\+?[0-9]{10,15}$/;
//     if (!phoneRegex.test(phoneNumber)) {
//       return res.status(400).json({
//         message: "Invalid phone number format",
//       });
//     }

//     // 5. Duplicate email check (generic message to prevent enumeration)
//     const userExist = await User.findOne({ email });
//     if (userExist) {
//       return res.status(400).json({
//         message: "user already exists.",
//       });
//     }

//     // 6. Cryptographically secure OTP
//     const otp = crypto.randomInt(100000, 999999);
//     const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // 7. Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 8. Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       phoneNumber,
//       otp,
//       otpExpiresAt,
//       isVerified: false,
//     });

//     // 9. Send verification email
//     const emailSent = await sendMail(
//       email,
//       "SafeCampus Email Verification",
//       `
//         <h2>Hello ${name}</h2>
//         <p>Your OTP for email verification is:</p>
//         <h1>${otp}</h1>
//         <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//         <p>If you did not request this, please ignore this email.</p>
//       `,
//     );

//     // 10. Rollback user creation if email fails
//     if (!emailSent) {
//       await User.deleteOne({ _id: user._id });
//       return res.status(500).json({
//         message: "Registration failed. Please try again.",
//       });
//     }

//     res.status(201).json({
//       message: "User registered successfully. Please verify your email.",
//     });
//   } catch (error) {
//     // 11. Safe error logging (avoid leaking stack traces)
//     console.error(
//       `[UserRegisterController] ${new Date().toISOString()}:`,
//       error.message,
//     );

//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// };
// Email Verification Controller
export const VerifyEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Presence check
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // 2. Find user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. Check if OTP is valid and not expired
    if (existingUser.otp != otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (existingUser.otpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // 4. Mark user as verified
    existingUser.isVerified = true;
    existingUser.otp = undefined;
    existingUser.otpExpiresAt = undefined;
    await existingUser.save();
    generateTokenAndSetCookie(res, existingUser);
    console.log("it is token:  ", generateTokenAndSetCookie(res, existingUser));

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error(
      `[VerifyEmailController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Future controllers for login, password reset, etc.
export const UserLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        message: "You do not have an account. Please register first.",
      });
    }
    if (!existingUser.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }
    if (!(await bcrypt.compare(password, existingUser.password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    generateTokenAndSetCookie(res, existingUser);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error(
      `[UserLoginController] ${new Date().toISOString()}:`,
      error.message,
    );
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//logout controller
export const LogoutController = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};


//sign up for security personnel by admin
// controllers/security.controller.js
export const addSecurityController = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, location, shift, status } = req.body;

    // Validation
    if (!name || !email || !password || !phoneNumber || !location || !shift)
      return res.status(400).json({ message: "All fields are required." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber))
      return res.status(400).json({ message: "Invalid phone number format." });

    const validShifts = ["morning", "evening", "night"];
    if (!validShifts.includes(shift))
      return res.status(400).json({ message: "Invalid shift value." });

    // Reuse core — role = "security", extra fields passed in
    await createUserWithOtp({
      name,
      email,
      password,
      phoneNumber,
      role: "security",
      extraFields: {
        location,
        shift,
        status: status ?? "active",
      },
      emailSubject: "SafeCampus – Security Account Verification",
      emailHtml: (otp) => `
  <div  style="font-family:sans-serif;max-width:480px;margin:auto" >
    <h2 style="color:#1d4ed8">Welcome to SafeCampus 🔐</h2>
    <p>Hello <strong>${name}</strong>, your admin has registered you as a Security Guard.</p>
    <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;
      color:#1d4ed8;text-align:center;padding:16px 0">${otp}</div>
    <p style="color:#6b7280;font-size:.85rem">Expires in <strong>10 minutes</strong>.</p>
  </div>`,
    });

    res.status(201).json({
      message: "Security guard created. OTP sent to their email.",
    });
  } catch (err) {
    console.error(`[addSecurityController] ${new Date().toISOString()}:`, err.message);
    res.status(err.status ?? 500).json({ message: err.message || "Internal Server Error" });
  }
};