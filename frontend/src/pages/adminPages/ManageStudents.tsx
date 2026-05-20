import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";

type Student = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
};

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

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

function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  useEffect(() => {
    fetchStudents();
  }, []);

async function fetchStudents() {
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/students`, {
      credentials: "include",
    });
    const data = await res.json();

    if (res.ok) {
      setStudents(data.students); // ← was data, should be data.students
    } else {
      toast.error(data.message || "Failed to fetch students");
    }
  } catch {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
}

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/students/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s._id !== id));
        toast.success(`${name} removed`);
      } else {
        toast.error("Failed to delete student");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  // Sort: newest first, then filter
  const filtered = students
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchQ =
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchQ && matchStatus;
    });

  const newCount = students.filter((s) => isNew(s.createdAt)).length;

  return (
    <DashboardLayout title="Manage Students">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-gray-900">Students</h2>
            {newCount > 0 && (
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5">
                {newCount} new
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-45">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-md outline-none focus:border-emerald-500 bg-white"
            />
          </div>
          <select
            title="status"
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
        </div>

        <p className="text-sm text-gray-400">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""} shown
        </p>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-400 py-8 text-center">
            Loading students...
          </p>
        )}

        {/* Desktop Table */}
        {!loading && (
          <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Student", "Email", "Phone", "Status", "Joined"].map(
                    (h) => (
                      <th
                        key={h === "Actions" ? "" : h}
                        className="text-left px-4 py-2.5 text-xs font-medium text-gray-400"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-medium flex items-center justify-center flex-shrink-0">
                            {initials(s.name)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {s.name}
                          </span>
                          {isNew(s.createdAt) && (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{s.email}</td>
                      <td className="px-4 py-3 text-gray-500">{s.phone}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            s.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {fmt(s.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(s._id, s.name)}
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
                No students found
              </p>
            ) : (
              filtered.map((s) => (
                <div
                  key={s._id}
                  className={`border rounded-xl p-4 bg-white space-y-3 ${
                    isNew(s.createdAt) ? "border-blue-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 text-sm font-medium flex items-center justify-center flex-shrink-0">
                      {initials(s.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 text-sm">
                          {s.name}
                        </p>
                        {isNew(s.createdAt) && (
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        s.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{s.phone}</span>
                    <span>Joined {fmt(s.createdAt)}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleDelete(s._id, s.name)}
                      className="w-full text-sm text-red-500 border border-red-100 rounded-md py-1.5 hover:bg-red-50 transition-colors"
                    >
                      Delete student
                    </button>
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

export default ManageStudents;
