import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type AuthCheckProps = {
  children: React.ReactNode;
  requiredRole: "admin" | "student" | "security";
};

function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const { user, isLoading } = useAuth();

  // 1. Wait for auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  // 2. Not logged in
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Wrong role
  if (user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Allowed
  return <>{children}</>;
}

export default AuthCheck;
