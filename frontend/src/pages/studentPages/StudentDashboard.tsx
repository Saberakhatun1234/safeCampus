import StatsCard from "@/components/common/Statscart";
import DashboardLayout from "@/layouts/DashboardLayout";

function StudentDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <StatsCard title="Total Courses" value={12} />
      <StatsCard title="Completed" value={8} />
      <StatsCard title="In Progress" value={4} />
    </DashboardLayout>
  );
}

export default StudentDashboard;
