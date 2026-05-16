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
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-2xl font-bold text-emerald-600 mb-8">SafeCampus</h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg transition-all
              ${
                active
                  ? "bg-emerald-100 text-emerald-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
