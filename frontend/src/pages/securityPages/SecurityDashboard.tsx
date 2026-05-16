import DashboardLayout from "@/layouts//DashboardLayout";

function SecurityDashboard() {
  return (
    <DashboardLayout title="Security Dashboard">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Welcome Security Staff</h2>

        <p className="text-gray-600">SafeCampus security dashboard is ready.</p>
      </div>
    </DashboardLayout>
  );
}

export default SecurityDashboard;
