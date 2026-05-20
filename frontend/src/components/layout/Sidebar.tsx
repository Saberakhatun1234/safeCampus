import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const location = useLocation();

  // Role-based menu
  const menuItems =
    user?.role === "admin"
      ? [
          {
            name: "Dashboard",
            path: "/admin/dashboard",
          },
          {
            name: "Manage Students",
            path: "/admin/students",
          },
          {
            name: "Reports",
            path: "/admin/reports",
          },
          {
            name:"SOS Reports",
            path:"/admin/sos-reports"
          },
          {
            name: "Manage Security",
            path: "/admin/security",
          },
          {
            name: "Add Security",
            path: "/admin/security/add",
          }
        ]
      : user?.role === "security"
        ? [
            {
              name: "Dashboard",
              path: "/security/dashboard",
            },
            {
              name: "SOS Alerts",
              path: "/security/sos",
            },
            {
              name: "Reports",
              path: "/security/reports",
            },
          ]
        : [
            {
              name: "Dashboard",
              path: "/student/dashboard",
            },
            {
              name: "Report Incident",
              path: "/student/report",
            },
            {
              name: "SOS Alert",
              path: "/student/sos",
            },
          ];

  return (
    <div className="relative">
      <aside className="fixed min-h-screen w-64 border-r bg-white p-4">
        <h2 className="mb-8 text-2xl font-bold text-emerald-600">SafeCampus</h2>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path || index}
                to={item.path}
                className={`rounded-lg px-4 py-2 transition-all ${
                  active
                    ? "bg-emerald-100 font-medium text-emerald-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
