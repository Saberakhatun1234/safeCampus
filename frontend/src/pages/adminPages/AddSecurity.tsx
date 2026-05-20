import React, { useRef, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
function AddSecurity() {
  // ---------------- STATES ----------------
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [createdGuard, setCreatedGuard] = useState<any>(null);

  // form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    location: "",
    shift: "",
    status: "active",
  });

  // errors
  const [errors, setErrors] = useState<any>({});

  // otp
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
 const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ---------------- HANDLE INPUT ----------------
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // ---------------- VALIDATION ----------------
  function validateForm() {
    let newErrors: any = {};

    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!form.location) newErrors.location = "Location is required";
    if (!form.shift) newErrors.shift = "Shift is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // ---------------- CREATE SECURITY ----------------
  async function handleSubmit() {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/security/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent successfully");

        setCreatedGuard(form);
        setStep(2);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- OTP CHANGE ----------------
  function handleOtpChange(value: string, index: number) {
    value = value.replace(/\D/g, "");

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // next input focus
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  // backspace focus
  function handleOtpKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  // ---------------- VERIFY OTP ----------------
  async function handleVerifyOtp() {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Enter complete OTP");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: createdGuard.email,
            otp: otpCode,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Guard verified successfully");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.log(error);
      toast.error("Network error");
    } finally {
      setOtpLoading(false);
    }
  }

  // ---------------- RESET ----------------
  function handleReset() {
    setStep(1);

    setForm({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      location: "",
      shift: "",
      status: "active",
    });

    setErrors({});
    setOtp(["", "", "", "", "", ""]);
  }

  return (
    <DashboardLayout title="Add Security">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            👮 Add Security Guard
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Create a new security account and verify with OTP
          </p>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
            <h3 className="text-lg font-semibold text-gray-700">
              Guard Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter guard name"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {errors.phoneNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Password
                </label>

                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Main Gate"
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                {errors.location && (
                  <p className="text-xs text-red-500 mt-1">{errors.location}</p>
                )}
              </div>

              {/* Shift */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Shift
                </label>

                <select
                  title="Shift"
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">Select Shift</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>

                {errors.shift && (
                  <p className="text-xs text-red-500 mt-1">{errors.shift}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>

              <select
                title="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium"
            >
              {loading ? "Creating..." : "Create & Send OTP"}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center space-y-5">
            <h3 className="text-xl font-semibold text-gray-700">Verify OTP</h3>

            <p className="text-gray-500 text-sm">
              OTP sent to{" "}
              <span className="font-medium text-gray-700">
                {createdGuard.email}
              </span>
            </p>

            {/* OTP BOXES */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el: HTMLInputElement | null) => {
              otpRefs.current[index] = el;
          }}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-12 h-12 border rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              ))}
            </div>

            {/* Button */}
            <Button
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center space-y-5">
            <div className="text-5xl">✅</div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Guard Verified
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Security guard account created successfully
              </p>
            </div>

            {/* Guard Info */}
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              <p>
                <span className="font-semibold">Name:</span> {createdGuard.name}
              </p>

              <p>
                <span className="font-semibold">Email:</span>{" "}
                {createdGuard.email}
              </p>

              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {createdGuard.phoneNumber}
              </p>

              <p>
                <span className="font-semibold">Location:</span>{" "}
                {createdGuard.location}
              </p>

              <p>
                <span className="font-semibold">Shift:</span>{" "}
                {createdGuard.shift}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-100"
              >
                Add Another
              </Button>


            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AddSecurity;
