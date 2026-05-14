//Register or Sign up

// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const protectUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, please login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (error) {
    console.error(`[protectUser] ${new Date().toISOString()}:`, error.message);
    return res.status(401).json({ success: false, message: "Session expired, please login again" });
  }
};