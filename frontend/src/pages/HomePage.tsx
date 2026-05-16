import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-medium text-lg">
          🛡️ SafeCampus
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/auth/login")}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/auth/register")}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-24 gap-6">
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
          Campus safety, reimagined
        </span>

        <h1 className="text-4xl font-medium max-w-xl leading-tight">
          Keep your campus{" "}
          <span className="text-emerald-600">safe & connected</span>
        </h1>

        <p className="text-gray-500 max-w-md text-base leading-relaxed">
          SafeCampus helps students, security, and admins stay informed and
          respond faster — all in one place.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate("/auth/register")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
          >
            Get started free
          </button>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-3 border rounded-md hover:bg-gray-50"
          >
            Sign in →
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
