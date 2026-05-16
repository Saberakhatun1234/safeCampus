import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

function Sos() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function sendSOS() {
    setLoading(true);

    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/sos/createSOS`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              userId: user?.id, 
                latitude,
                 longitude,
              
              message: "Emergency SOS Alert",
            }),
          },
        );

        const data = await res.json();

        if (res.ok) {
          toast.success("SOS sent successfully 🚨");
        } else {
          toast.error(data.message || "Failed to send SOS");
        }

        setLoading(false);
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Emergency SOS">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Emergency SOS</h2>

          <p className="text-gray-600 mt-2">
            Press the button in case of emergency
          </p>
        </div>

        <button
          onClick={sendSOS}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-full text-xl font-bold shadow-lg"
        >
          {loading ? "Sending..." : "SEND SOS"}
        </button>
      </div>
    </DashboardLayout>
  );
}

export default Sos;
