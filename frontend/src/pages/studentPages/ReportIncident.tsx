import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";

function ReportIncident() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !description || !location) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/report/reportCreated`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ sends cookie
          body: JSON.stringify({ title, description, location, isAnonymous }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Report submitted successfully 🎉");
        // reset form
        setTitle("");
        setDescription("");
        setLocation("");
        setIsAnonymous(false);
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Report Incident">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-2xl font-bold">Report an Incident</h1>
        <p className="text-sm text-gray-500">
          Describe the incident — our AI will automatically assess the severity.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              placeholder="Brief title of the incident"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              placeholder="Where did this happen? e.g. Library Block B"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Describe the incident in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={5}
              required
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-600">
              Submit anonymously
            </label>
          </div>

          {/* AI note */}
          <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
            🤖 Severity will be automatically assigned by AI based on your
            description.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default ReportIncident;
