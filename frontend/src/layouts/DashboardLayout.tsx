import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuth();
   const navigate = useNavigate();



   async function handleLogout() {
     await logout();

     toast.success("Logged out successfully");

     navigate("/");
   }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-5">
        <h1 className="text-2xl font-bold mb-8">SafeCampus</h1>

        <nav className="flex flex-col gap-3">
          {/* Student Links */}
          {user?.role === "student" && (
            <>
              <Link to="/student/dashboard">Dashboard</Link>

              <Link to="/student/report">Report Issue</Link>

              <Link to="/student/complaints">Complaints</Link>

              <Link to="/student/sos">SOS Alert</Link>
            </>
          )}

          {/* Admin Links */}
          {user?.role === "admin" && (
            <>
              <Link to="/admin/dashboard">Dashboard</Link>

              <Link to="/admin/reports">Reports</Link>

              <Link to="/admin/complaints">Complaints</Link>

              <Link to="/admin/sos">SOS Alerts</Link>
            </>
          )}

          {/* Security Links */}
          {user?.role === "security" && (
            <>
              <Link to="/security/dashboard">Dashboard</Link>

              <Link to="/security/sos">SOS Alerts</Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Welcome, {user?.name}</h2>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
