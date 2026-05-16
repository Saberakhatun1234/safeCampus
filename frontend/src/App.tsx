import { BrowserRouter, Routes, Route } from "react-router-dom";


import AuthCheck from "./components/common/AuthCheck";
import HomePage from "./pages/HomePage";
import Login from "./pages/authPages/Login";
import Register from "./pages/authPages/Register";
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import StudentDashboard from "./pages/studentPages/StudentDashboard";
import SecurityDashboard from "./pages/securityPages/SecurityDashboard";
import VerifyEmail from "./pages/authPages/VerifyEmail";
import { useAuth } from "./context/AuthContext";
import Unauthorized from "./pages/UnAuthorize";
import { Toaster } from "./components/ui/sonner";
function App() {
    const { user, isAuthenticated, isLoading } = useAuth();
     if (isLoading) {
       return (
         <div className="min-h-screen flex items-center justify-center">
           <p className="text-gray-400 text-sm">Loading...</p>
         </div>
       );
     }
  return (
    <>
      {" "}
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public routes — no auth check */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes — wrapped individually */}
          <Route
            path="/admin/dashboard"
            element={
              <AuthCheck
                isAuthenticated={isAuthenticated}
                user={user}
                requiredRole="admin"
              >
                <AdminDashboard />
              </AuthCheck>
            }
          />
          <Route
            path="/security/dashboard"
            element={
              <AuthCheck
                isAuthenticated={isAuthenticated}
                user={user}
                requiredRole="security"
              >
                <SecurityDashboard />
              </AuthCheck>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <AuthCheck
                isAuthenticated={isAuthenticated}
                user={user}
                requiredRole="student"
              >
                <StudentDashboard />
              </AuthCheck>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
