import { Navigate } from "react-router-dom";

type User = {
  role: "admin" | "student" | "security";
} | null;

type AuthCheckProps = {
  isAuthenticated: boolean;
  user: User;
  requiredRole?: "admin" | "student" | "security";
  children: React.ReactNode;
};

function AuthCheck({
  isAuthenticated,
  user,
  requiredRole,
  children,
}: AuthCheckProps) {
  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in but wrong role
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === "admin")
      return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "security")
      return <Navigate to="/security/dashboard" replace />;
    return <Navigate to="/student/home" replace />;
  }

  return <>{children}</>;
}

export default AuthCheck;
