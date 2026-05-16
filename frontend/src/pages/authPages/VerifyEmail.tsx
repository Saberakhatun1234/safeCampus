import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from Register page via navigation state
  const email = location.state?.email || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/auth/register");
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function handleChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError("");

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const updated = Array(6).fill("");
    paste.split("").forEach((ch, i) => {
      updated[i] = ch;
    });
    setOtp(updated);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  }

  function handleResend() {
    setOtp(Array(6).fill(""));
    setError("");
    setSeconds(30);
    setCanResend(false);
    inputRefs.current[0]?.focus();

    // 🔧 Call your resend OTP API here
    console.log("Resending OTP to", email);
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 🔧 Replace with real API call
      // const res = await verifyOTP({ email, otp: code });
      // const { user, token } = res;
      // login(user, token); // from AuthContext

      // Fake success for now
      await new Promise((r) => setTimeout(r, 1000));
      setSuccess(true);

      setTimeout(() => {
        navigate("/student/home"); // will come from role later
      }, 1500);
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

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
            <span className="font-medium text-gray-800">{email}</span>. Enter it
            below to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* OTP inputs */}
          <div className="flex gap-2 justify-between">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-11 h-14 text-center text-xl font-medium border rounded-md outline-none transition-all
                  ${digit ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200"}
                  ${error ? "border-red-400 bg-red-50" : ""}
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100`}
              />
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
              ✓ Email verified! Redirecting...
            </p>
          )}

          {/* Timer / Resend */}
          <p className="text-sm text-gray-500">
            {canResend ? (
              <>
                Didn't get the code?{" "}
                <button
                  onClick={handleResend}
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Resend
                </button>
              </>
            ) : (
              <>
                Resend code in{" "}
                <span className="text-emerald-600 font-medium">
                  {formatTime(seconds)}
                </span>
              </>
            )}
          </p>

          <Button
            onClick={handleVerify}
            disabled={loading || success}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;
