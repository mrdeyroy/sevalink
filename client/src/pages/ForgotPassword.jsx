import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Phone, Lock, Eye, EyeOff, CheckCircle, RefreshCw } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import API_BASE_URL from "../config/api";

const isMobileNumber = (val) => /^[6-9]\d{9}$/.test(val.trim());

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: identifier, 2: OTP, 3: new password
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    const detectedType = isMobileNumber(identifier) ? "mobile" : identifier.includes("@") ? "email" : null;

    // Countdown timer for OTP expiry
    useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [step, timeLeft]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { identifier });
            setStep(2);
            setTimeLeft(300); // 5 minutes
            setSuccess("OTP sent! Check your email or SMS.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");
        if (!otp || otp.length !== 6) {
            return setError("Please enter the 6-digit OTP.");
        }
        if (!newPassword || !confirmPassword) {
            return setError("Please fill in both password fields.");
        }
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        if (newPassword.length < 8 || !/\d/.test(newPassword)) {
            return setError("Password must be at least 8 characters and contain at least one number.");
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/verify-otp-reset`, {
                identifier,
                otp,
                newPassword,
            });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <AuthLayout gradient="from-slate-50 via-blue-50 to-indigo-50">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-100/40 border border-slate-100 overflow-hidden"
                style={{ animation: "fadeSlideUp 0.35s ease-out both" }}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-10 pb-8 text-center overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 shadow-lg">
                            <Lock size={26} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
                        <p className="text-blue-200 text-sm mt-1 font-medium">
                            {step === 1 && "Enter your email or mobile"}
                            {step === 2 && "Enter the OTP sent to you"}
                            {step === 3 && "Password reset successful!"}
                        </p>
                        {/* Step indicator */}
                        <div className="flex justify-center gap-2 mt-4">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? "bg-white w-8" : "bg-white/30 w-4"}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8">
                    {/* Error message */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm"
                            style={{ animation: "shake 0.3s ease-out" }}>
                            <span className="mt-0.5 shrink-0">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* STEP 1: Enter identifier */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">
                                    Email or Mobile Number
                                </label>
                                <div className="relative group">
                                    {detectedType === "mobile"
                                        ? <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                                        : <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    }
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                                        placeholder="you@example.com or 9876543210"
                                        value={identifier}
                                        onChange={e => setIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    We'll send a 6-digit OTP to reset your password.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !identifier}
                                className="w-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/40 hover:-translate-y-0.5 text-sm tracking-wide"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending OTP…
                                    </span>
                                ) : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: Enter OTP + new password */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                                    {success}
                                </div>
                            )}

                            {/* Timer */}
                            {timeLeft > 0 ? (
                                <div className="text-center text-sm text-slate-500">
                                    OTP expires in{" "}
                                    <span className={`font-bold ${timeLeft < 60 ? "text-red-500" : "text-blue-600"}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-red-500 font-medium">
                                    OTP expired.{" "}
                                    <button type="button" onClick={() => { setStep(1); setError(""); setOtp(""); }} className="underline text-blue-600">
                                        Request a new one
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">6-Digit OTP</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm text-center tracking-widest text-lg font-bold placeholder:text-slate-300 placeholder:font-normal placeholder:text-base placeholder:tracking-normal"
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">New Password</label>
                                <div className="relative group">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                                        placeholder="At least 8 chars + 1 number"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || timeLeft === 0}
                                className="w-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/40 hover:-translate-y-0.5 text-sm tracking-wide"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying…
                                    </span>
                                ) : "Reset Password"}
                            </button>

                            <button type="button"
                                onClick={() => { setStep(1); setError(""); setOtp(""); setSuccess(""); }}
                                className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-2"
                            >
                                <RefreshCw size={14} /> Resend OTP
                            </button>
                        </form>
                    )}

                    {/* STEP 3: Success */}
                    {step === 3 && (
                        <div className="text-center space-y-5">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Password Reset!</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Your password has been updated successfully. You can now log in with your new password.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:-translate-y-0.5 text-sm"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-5px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-3px); }
                    80% { transform: translateX(3px); }
                }
            `}</style>
        </AuthLayout>
    );
};

export default ForgotPassword;
