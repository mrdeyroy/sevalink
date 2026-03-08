import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import API_BASE_URL from "../config/api";

const VerifyEmail = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const { googleLogin } = useAuth();

    const [otp, setOtp] = useState("");
    const [status, setStatus] = useState("idle"); // "idle" | "verifying" | "success" | "error"
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(30);

    // Initial countdown timer
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setStatus("verifying");
        setMessage("");

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/verify`, {
                email,
                otp
            });

            setStatus("success");
            googleLogin(data.token);

            setTimeout(() => {
                if (data.role === "admin") navigate("/admin");
                else if (data.role === "worker") navigate("/worker");
                else navigate("/dashboard");
            }, 1500);
        } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.message || "Invalid OTP code.");
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setStatus("idle");
        setMessage("");

        try {
            await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, { email });
            setMessage("A new OTP has been sent to your email.");
            setTimer(30);
        } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.message || "Failed to resend OTP. Try again later.");
        }
    };

    if (status === "success") {
        return (
            <AuthLayout gradient="from-slate-50 via-blue-50 to-indigo-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center"
                    style={{ animation: "fadeSlideUp 0.35s ease-out both" }}>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-green-500 text-3xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                    <p className="text-gray-500 text-sm">Your account is active. Redirecting you to your dashboard…</p>
                </div>
                <style>{`
                    @keyframes fadeSlideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout gradient="from-slate-50 via-blue-50 to-indigo-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                style={{ animation: "fadeSlideUp 0.35s ease-out both" }}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 px-8 pt-10 pb-8 text-center overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Verify your Email</h1>
                        <p className="text-blue-200 text-sm mt-1 font-medium">SevaLink Account Activation</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-8">
                    <p className="text-slate-500 text-sm text-center mb-6">
                        Enter the 6-digit code sent to{" "}
                        <strong className="text-slate-700">{email}</strong>
                    </p>

                    {message && (
                        <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm border
                            ${status === "error"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-green-50 border-green-200 text-green-700"}`}>
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-5">
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="• • • • • •"
                            className="w-full text-center text-3xl tracking-[0.5em] font-mono px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-300 placeholder:text-2xl placeholder:tracking-normal"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            required
                        />
                        <button
                            type="submit"
                            disabled={status === "verifying" || otp.length < 6}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-blue-200 hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
                        >
                            {status === "verifying" ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying…
                                </>
                            ) : "Verify Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Didn't receive a code?{" "}
                        {timer > 0 ? (
                            <span className="text-slate-400 cursor-not-allowed">Resend in {timer}s</span>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Send code again
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AuthLayout>
    );
};

export default VerifyEmail;
