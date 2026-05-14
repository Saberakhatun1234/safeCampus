// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "30m" },
  );

  res.cookie("token", token, {
    httpOnly: true, // not accessible via JS (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    maxAge: 30 * 60 * 1000, // 30 minutes in ms
  });

  return token;
};
