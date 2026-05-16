import DashboardLayout from "@/layouts/DashboardLayout";

function StudentDashboard() {
  return (
    <DashboardLayout title="Student Dashboard">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Welcome Student</h2>

        <p className="text-gray-600">SafeCampus student dashboard is ready.</p>
      </div>
    </DashboardLayout>
  );
}

export default StudentDashboard;
