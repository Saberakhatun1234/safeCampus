import DashboardLayout from "@/layouts/DashboardLayout";

function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Welcome Admin</h2>

        <p className="text-gray-600">SafeCampus admin panel is ready.</p>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
