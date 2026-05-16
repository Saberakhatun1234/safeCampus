export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.role); // ✅ see what role is coming
    console.log("Required roles:", roles); // ✅ see what roles are required

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
