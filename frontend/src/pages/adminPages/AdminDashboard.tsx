import StatsCard from "@/components/common/Statscart";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


function AdminDashboard() {
  const { logout } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    await logout();

    toast.success("Logged out successfully");

    navigate("/");
  }

  return (
    <DashboardLayout>
      <button onClick={handleLogout}>Logout</button>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <StatsCard title="Total Users" value={120} />
      <StatsCard title="Reports" value={30} />
      <StatsCard title="Active SOS" value={4} />
      <StatsCard title="Pending Complaints" value={8} />
    </DashboardLayout>
  );
}

export default AdminDashboard;