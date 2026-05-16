import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "../components/layout/Sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
};

function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-gray-500">Welcome {user?.name}</p>
          </div>

          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
