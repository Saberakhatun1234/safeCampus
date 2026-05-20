//here report show hoga admin ko, jisme user ke dwara kiye gaye reports dikhaye jayenge, aur admin unhe manage kar sakta hai, jaise ki report ko resolve karna ya delete karna etcimport React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Label } from "@/components/ui/label";
import {useState , useEffect} from "react"
import React from "react";
type Incident = {
  _id: string;
  title: string;
  description: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "Investigating" | "Resolved";
  location: string;
  isAnonymous: boolean;
  reportedBy: {
    name: string;
    email: string;
  } | null;
  createdAt: string;
};

const CATEGORIES = [
  "All",
  "Ragging",
  "Harassment",
  "Theft",
  "Fight/Violence",
  "Medical Emergency",
];
const SEVERITIES = ["All", "Low", "Medium", "High"];
const STATUSES = ["All", "Open", "Investigating", "Resolved"];

function AdminReport() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  async function fetchIncidents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (severityFilter !== "All") params.append("severity", severityFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/report/reportAll?${params.toString()}`,
        { credentials: "include" },
      );

      const data = await res.json();

    if (res.ok) {
      const order: Record<string, number> = {
        Open: 0,
        Investigating: 1,
        Resolved: 2,
      };
      const sorted = (data.incidents || []).sort((a: Incident, b: Incident) => {
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
      setIncidents(sorted.reverse()); // show newest first
    } else {
      toast.error(data.message || "Failed to fetch incidents");
    }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/report/reportAll/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        fetchIncidents();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, [categoryFilter, severityFilter, statusFilter]);

  const severityColor = (severity: string) => {
    if (severity === "High") return "bg-red-100 text-red-700";
    if (severity === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const statusColor = (status: string) => {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "Investigating") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <DashboardLayout title="Incident Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Incident Reports
          </h2>
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-gray-500 font-medium">
              Category
            </Label>
            <select
              title="Category"
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-gray-500 font-medium">
              Severity
            </Label>
            <select title="severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {SEVERITIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-gray-500 font-medium">Status</Label>
            <select
              title="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading incidents...
          </div>
        )}

        {/* Empty state */}
        {!loading && incidents.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-medium">No incidents found</p>
          </div>
        )}

        {/* ─── MOBILE: Cards ─── */}
        <div className="grid gap-4 md:hidden">
          {incidents.map((incident) => (
            <div
              key={incident._id}
              className="bg-white border rounded-xl shadow-sm p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {incident.title}
                  </p>
                  <p className="text-xs text-gray-500">{incident.category}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor(incident.severity)}`}
                  >
                    {incident.severity}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(incident.status)}`}
                  >
                    {incident.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {incident.description}
              </p>

              <div className="text-xs text-gray-400 space-y-0.5">
                <p>📍 {incident.location}</p>
                <p>
                  👤{" "}
                  {incident.isAnonymous
                    ? "Anonymous"
                    : (incident.reportedBy?.name ?? "—")}
                </p>
                <p>🕒 {new Date(incident.createdAt).toLocaleString()}</p>
              </div>

              {incident.status !== "Resolved" && (
                <div className="flex gap-2 pt-1">
                  {incident.status === "Open" && (
                    <button
                      onClick={() =>
                        updateStatus(incident._id, "Investigating")
                      }
                      className="text-xs px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                    >
                      Investigating
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(incident._id, "Resolved")}
                    className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── DESKTOP: Table ─── */}
        <div className="hidden md:block overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm text-left">

            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
       
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Reported By</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {incidents.map((incident) => (
  <React.Fragment key={incident._id}>
    <tr
                    key={incident._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpanded(
                        expanded === incident._id ? null : incident._id,
                      )
                    }
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {incident.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {incident.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityColor(incident.severity)}`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(incident.status)}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {incident.location}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {incident.isAnonymous
                        ? "Anonymous"
                        : (incident.reportedBy?.name ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(incident.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {incident.status !== "Resolved" ? (
                        <div className="flex gap-1">
                          {incident.status === "Open" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(incident._id, "Investigating");
                              }}
                              className="text-xs px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
                            >
                              Investigating
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(incident._id, "Resolved");
                            }}
                            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                          >
                            Resolved
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded description row */}
                  {expanded === incident._id && (
                    <tr key={`${incident._id}-expanded`} className="bg-blue-50">
                      <td
                        colSpan={8}
                        className="px-6 py-3 text-sm text-gray-700"
                      >
                        <span className="font-medium">Description: </span>
                        {incident.description}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminReport;
