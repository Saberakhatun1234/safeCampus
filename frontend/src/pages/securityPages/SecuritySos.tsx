import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";

type SOS = {
  _id: string;
  message: string;
  latitude: number;
  longitude: number;
  user: {
    name: string;
    email: string;
  } | null;
  status: "Open" | "Investigating" | "Resolved";
  createdAt: string;
};

function SecuritySos() {
  const [sosList, setSosList] = useState<SOS[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchSOS() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sos/getAllSOS`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

     if (res.ok) {
       const order: Record<string, number> = {
         Open: 0,
         Investigating: 1,
         Resolved: 2,
       };
       const sorted = (data.alerts || []).sort((a: SOS, b: SOS) => {
         return (order[a.status] ?? 3) - (order[b.status] ?? 3);
       });
       setSosList(sorted); // show newest first
     } else {
       toast.error(data.message || "Failed to fetch SOS alerts");
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        fetchSOS(); // refresh list
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    fetchSOS();
  }, []);

  const statusColor = (status: string) => {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "Investigating") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <DashboardLayout title="SOS Alerts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-red-600">🚨 SOS Alerts</h2>
          <button
            onClick={fetchSOS}
            disabled={loading}
            className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            {loading ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading SOS alerts...
          </div>
        )}

        {/* Empty state */}
        {!loading && sosList.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-medium">No active SOS alerts</p>
          </div>
        )}

        {/* SOS Cards */}
        <div className="grid gap-4">
          {sosList.map((sos) => (
            <div
              key={sos._id}
              className="bg-white border rounded-xl shadow-sm p-5 space-y-3"
            >
              {/* Top row — name + status badge */}
              <div className="flex items-center justify-between">
                <div>
                  {/* Message */}
                  <p className="text-gray-700 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {sos.message}
                  </p>

                  {/* Time */}
                  <p className="text-xs text-gray-400">
                    🕒 {new Date(sos.createdAt).toLocaleString()}
                  </p>

                  {/* Location link */}
                  <a
                    href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 text-sm underline"
                  >
                    📍 View Location on Google Maps
                  </a>
                </div>
                <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(sos.status)}`}
                >
                  {sos.status}
                </span>
                {/* Status update buttons */}
                {sos.status !== "Resolved" && (
                  <div className="flex gap-2 pt-1">
                    {sos.status === "Open" && (
                      <button
                        onClick={() => updateStatus(sos._id, "Investigating")}
                        className="text-xs px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                      >
                        Mark Investigating
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(sos._id, "Resolved")}
                      className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      Mark Resolved
                    </button>
                    
                  </div>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SecuritySos;
