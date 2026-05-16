import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/context/AuthContext";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  // Email from Register page
  const email = location.state?.email || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  // const [seconds, setSeconds] = useState(30);
  // const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if email missing
  useEffect(() => {
    if (!email) {
      navigate("/auth/register");
    }
  }, [email, navigate]);

  // Timer
  // useEffect(() => {
  //   if (seconds <= 0) {
  //     setCanResend(true);
  //     return;
  //   }

  //   const timer = setTimeout(() => {
  //     setSeconds((prev) => prev - 1);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [seconds]);

  // OTP input
  function handleChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;

    setOtp(updated);

    // Auto next focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // Keyboard support
  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // Paste support
  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    const updated = Array(6).fill("");

    pasted.split("").forEach((char, index) => {
      updated[index] = char;
    });

    setOtp(updated);

    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  // Verify OTP
  async function handleVerify() {
    const code = otp.join("");

    if (code.length < 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);

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
            email,
            otp: code,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid OTP");
        return;
      }

      toast.success("Email verified successfully");

      // Save user
      login(data.user);

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "security") {
        navigate("/security/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  // async function handleResend() {
  //   try {
  //     const res = await fetch(
  //       `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
  //       {
  //         method: "POST",

  //         headers: {
  //           "Content-Type": "application/json",
  //         },

  //         body: JSON.stringify({ email }),
  //       },
  //     );

  //     const data = await res.json();

  //     if (!res.ok) {
  //       toast.error(data.message || "Failed to resend OTP");
  //       return;
  //     }

  //     toast.success("OTP resent successfully");

  //     setOtp(Array(6).fill(""));
  //     setSeconds(30);
  //     setCanResend(false);

  //     inputRefs.current[0]?.focus();
  //   } catch (error) {
  //     console.log(error);

  //     toast.error("Something went wrong");
  //   }
  // }

  // Format timer
  // const formatTime = (s: number) =>
  //   `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
            <span className="text-2xl">✉️</span>
          </div>

          <CardTitle>Verify your email</CardTitle>

          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-800">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* OTP Inputs */}
          <div className="flex gap-2 justify-between">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-11 h-14 text-center text-xl font-medium
                ${
                  digit
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : ""
                }`}
              />
            ))}
          </div>

          {/* Resend
          <p className="text-sm text-gray-500">
            {canResend ? (
              <>
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Resend OTP
                </button>
              </>
            ) : (
              <>
                Resend OTP in{" "}
                <span className="font-medium text-emerald-600">
                  {formatTime(seconds)}
                </span>
              </>
            )}
          </p> */}

          {/* Verify Button */}
          <Button onClick={handleVerify} disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;
