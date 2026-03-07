import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
    User, Mail, Lock, Eye, EyeOff, UserPlus,
    Phone, ShieldCheck, RefreshCw, CheckCircle2,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const RESEND_COOLDOWN = 30; // seconds

const Register = () => {
    const navigate = useNavigate();
    const { register, sendMobileOTP, verifyMobileOTP } = useAuth();

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // OTP flow state
    // step: "form" | "otp" | "verified"
    const [step, setStep] = useState("form");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef(null);

    // Feedback
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [cooldown]);

    // ---------- Send OTP ----------
    const handleSendOTP = async () => {
        setError("");
        setInfo("");

        if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
            setError("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        setOtpLoading(true);
        try {
            await sendMobileOTP(mobile.trim());
            setOtpSent(true);
            setStep("otp");
            setInfo("OTP sent to your mobile number! It expires in 5 minutes.");
            setCooldown(RESEND_COOLDOWN);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    // ---------- Verify OTP ----------
    const handleVerifyOTP = async () => {
        setError("");
        setInfo("");

        if (!otp || otp.trim().length !== 6) {
            setError("Please enter the 6-digit OTP sent to your mobile.");
            return;
        }

        setVerifyLoading(true);
        try {
            await verifyMobileOTP(mobile.trim(), otp.trim());
            setMobileVerified(true);
            setStep("verified");
            setInfo("✓ Mobile number verified! You can now complete your registration.");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setVerifyLoading(false);
        }
    };

    // ---------- Final Registration ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!mobileVerified) {
            setError("Please verify your mobile number before registering.");
            return;
        }

        setLoading(true);
        try {
            const result = await register(name, email, mobile.trim(), password);
            if (result.mobile_only) {
                // Mobile-only: no email verification needed, go to login
                navigate("/login");
            } else {
                // Email + mobile: email verification required
                navigate(`/verify/${email}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ---------- Render ----------
    return (
        <AuthLayout gradient="from-slate-50 via-blue-50 to-indigo-50">
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-100/40 border border-slate-100 overflow-hidden"
                style={{ animation: "fadeSlideUp 0.35s ease-out both" }}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 px-8 pt-10 pb-8 text-center overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
                            <UserPlus size={26} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
                        <p className="text-blue-200 text-sm mt-1 font-medium">Join SevaLink — it&apos;s free</p>
                    </div>

                    {/* Step indicator */}
                    <div className="relative flex items-center justify-center gap-2 mt-5">
                        {["Details", "Verify Mobile", "Register"].map((label, i) => {
                            const stepIdx = i + 1;
                            const currentIdx = step === "form" ? 1 : step === "otp" ? 2 : 3;
                            const active = currentIdx === stepIdx;
                            const done = currentIdx > stepIdx;
                            return (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all
                                        ${done ? "bg-green-400/90 text-white" : active ? "bg-white text-blue-700" : "bg-white/20 text-blue-200"}`}>
                                        {done ? <CheckCircle2 size={11} /> : null}
                                        {label}
                                    </div>
                                    {i < 2 && <div className="w-4 h-px bg-white/30" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form body */}
                <div className="px-8 py-8">

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm"
                            style={{ animation: "shake 0.3s ease-out" }}>
                            <span className="mt-0.5 shrink-0">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Info */}
                    {info && (
                        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 mb-5 text-sm">
                            <span className="mt-0.5 shrink-0">ℹ</span>
                            <span>{info}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* ─── Name ─── */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <div className="relative group">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="register-name"
                                    type="text"
                                    autoComplete="name"
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 disabled:opacity-60"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={step === "otp"}
                                    required
                                />
                            </div>
                        </div>

                        {/* ─── Email ─── */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                                <span className="ml-1.5 text-xs font-normal text-slate-400">(Optional)</span>
                            </label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="register-email"
                                    type="email"
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 disabled:opacity-60"
                                    placeholder="you@example.com (leave blank to skip)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={step === "otp"}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Skip if you want to register with mobile number only.
                            </p>
                        </div>

                        {/* ─── Mobile + Send OTP ─── */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Mobile Number
                                {mobileVerified && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={11} /> Verified
                                    </span>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <div className="relative group flex-1">
                                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        id="register-mobile"
                                        type="tel"
                                        autoComplete="tel"
                                        maxLength={10}
                                        className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 disabled:opacity-60
                                            ${mobileVerified ? "border-green-300 bg-green-50/30" : "border-slate-200"}`}
                                        placeholder="10-digit mobile number"
                                        value={mobile}
                                        onChange={(e) => {
                                            setMobile(e.target.value.replace(/\D/g, ""));
                                            // Reset OTP state if mobile changes after sending
                                            if (otpSent) {
                                                setOtpSent(false);
                                                setMobileVerified(false);
                                                setStep("form");
                                                setOtp("");
                                                setInfo("");
                                            }
                                        }}
                                        disabled={mobileVerified}
                                        required
                                    />
                                </div>
                                {!mobileVerified && (
                                    <button
                                        type="button"
                                        id="send-otp-btn"
                                        onClick={handleSendOTP}
                                        disabled={otpLoading || cooldown > 0}
                                        className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all shadow-sm whitespace-nowrap"
                                    >
                                        {otpLoading ? (
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : cooldown > 0 ? (
                                            <><RefreshCw size={12} /> {cooldown}s</>
                                        ) : (
                                            <><Phone size={12} /> {otpSent ? "Resend" : "Send OTP"}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ─── OTP Input (shown after OTP sent, before verified) ─── */}
                        {step === "otp" && !mobileVerified && (
                            <div style={{ animation: "fadeSlideUp 0.25s ease-out both" }}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Enter OTP</label>
                                <div className="flex gap-2">
                                    <div className="relative group flex-1">
                                        <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            id="register-otp"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 tracking-[0.3em] font-mono"
                                            placeholder="------"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        id="verify-otp-btn"
                                        onClick={handleVerifyOTP}
                                        disabled={verifyLoading || otp.length !== 6}
                                        className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all shadow-sm whitespace-nowrap"
                                    >
                                        {verifyLoading ? (
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><ShieldCheck size={12} /> Verify</>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">OTP valid for 5 minutes. Check your SMS inbox.</p>
                            </div>
                        )}

                        {/* ─── Password ─── */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 disabled:opacity-60"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={step === "otp"}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* ─── Mobile verification nudge ─── */}
                        {!mobileVerified && step === "form" && (
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                📱 You must verify your mobile number before creating your account.
                            </p>
                        )}

                        {/* ─── Submit ─── */}
                        <button
                            id="register-btn"
                            type="submit"
                            disabled={loading || !mobileVerified}
                            className="w-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/40 hover:-translate-y-0.5 text-sm tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account…
                                </span>
                            ) : "Create Account"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-semibold tracking-wider">
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google */}
                    <button
                        id="google-register-btn"
                        onClick={() => window.location.href = "https://sevalink-zygf.vercel.app/api/auth/google"}
                        className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 py-3 rounded-xl transition-all text-sm font-medium text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Footer */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
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

export default Register;
