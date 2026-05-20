import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";

type ShiftType = "morning" | "evening" | "night";

type SecurityPerson = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  shift: ShiftType;
  status: "active" | "inactive";
  createdAt: string;
};

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
const SHIFT_TIMES = {
  morning: "6:00 AM - 2:00 PM",
  evening: "2:00 PM -10:00 PM",
  night: "10:00 PM - 6:00 AM",
};

function isNew(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < THREE_DAYS;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ManageSecurity() {
  const [guards, setGuards] = useState<SecurityPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [shiftFilter, setShiftFilter] = useState<"all" | ShiftType>("all");

  useEffect(() => {
    fetchGuards();
  }, []);

  async function fetchGuards() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/security`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setGuards(data.security);
      else toast.error(data.message || "Failed to fetch security personnel");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/security/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setGuards((prev) =>
          prev.map((g) =>
            g._id === id
              ? { ...g, status: newStatus as "active" | "inactive" }
              : g,
          ),
        );
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/security/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        setGuards((prev) => prev.filter((g) => g._id !== id));
        toast.success(`${name} removed`);
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const filtered = guards
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((g) => {
      const q = searchTerm.toLowerCase();
      const matchQ =
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || g.status === statusFilter;
      const matchShift = shiftFilter === "all" || g.shift === shiftFilter;
      return matchQ && matchStatus && matchShift;
    });

  const newCount = guards.filter((g) => isNew(g.createdAt)).length;

  const shiftColors: Record<ShiftType, string> = {
    morning: "bg-amber-50 text-amber-700 border-amber-200",
    evening: "bg-blue-50 text-blue-700 border-blue-200",
    night: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <DashboardLayout title="Manage Security">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-gray-900">
            Security Personnel
          </h2>
          {newCount > 0 && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5">
              {newCount} new
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-45">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, email or location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-md outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          <select title="status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="h-9 px-3 text-sm border border-gray-200 rounded-md outline-none bg-white"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select title="shift"
            value={shiftFilter}
            onChange={(e) =>
              setShiftFilter(e.target.value as typeof shiftFilter)
            }
            className="h-9 px-3 text-sm border border-gray-200 rounded-md outline-none bg-white"
          >
            <option value="all">All shifts</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </div>

        <p className="text-sm text-gray-400">
          {filtered.length} guard{filtered.length !== 1 ? "s" : ""} shown
        </p>

        {loading && (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        )}

        {/* Desktop Table */}
        {!loading && (
          <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Location",
                    "Shift",
                    "Status",
                    "Active",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-medium text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      No security personnel found
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr
                      key={g._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 text-xs font-medium flex items-center justify-center shrink-0">
                            {initials(g.name)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {g.name}
                          </span>
                          {isNew(g.createdAt) && (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{g.email}</td>
                      <td className="px-4 py-3 text-gray-500">{g.phone}</td>
                      <td className="px-4 py-3 text-gray-600">
                        📍 {g.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${shiftColors[g.shift]}`}
                        >
                          {g.shift}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {SHIFT_TIMES[g.shift]}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            g.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(g._id, g.status)}
                          className={`w-9 h-5 rounded-full transition-colors relative ${
                            g.status === "active"
                              ? "bg-emerald-500"
                              : "bg-gray-200"
                          }`}
                          aria-label={`Toggle ${g.name}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              g.status === "active"
                                ? "translate-x-4"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(g._id, g.name)}
                          className="text-xs text-red-500 border border-red-100 rounded-md px-3 py-1.5 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && (
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                No security personnel found
              </p>
            ) : (
              filtered.map((g) => (
                <div
                  key={g._id}
                  className={`border rounded-xl p-4 bg-white space-y-3 ${isNew(g.createdAt) ? "border-blue-200" : "border-gray-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 text-sm font-medium flex items-center justify-center shrink-0">
                      {initials(g.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 text-sm">
                          {g.name}
                        </p>
                        {isNew(g.createdAt) && (
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{g.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${shiftColors[g.shift]}`}
                    >
                      {g.shift}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <span>📞 {g.phone}</span>
                    <span>📍 {g.location}</span>
                    <span>🕐 {SHIFT_TIMES[g.shift]}</span>
                    <span>📅 {fmt(g.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                    <Button
                      onClick={() => handleToggle(g._id, g.status)}
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                        g.status === "active" ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          g.status === "active"
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </Button>
                    <span className="text-xs text-gray-500 flex-1">
                      {g.status === "active" ? "Active" : "Inactive"}
                    </span>
                    <Button  variant={"ghost"}
                      onClick={() => handleDelete(g._id, g.name)}
                      className="text-xs text-red-500 border border-red-100 rounded-md px-3 py-1.5 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ManageSecurity;
