import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Shield, Mail, Phone, HardHat } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

// Detect if string looks like a 10-digit Indian mobile number
const isMobileNumber = (val) => /^[6-9]\d{9}$/.test(val.trim());

const Login = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, user, googleLogin } = useAuth();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");

    useEffect(() => {
        if (errorParam) {
            setError(errorParam);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (tokenParam) {
            googleLogin(tokenParam);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [tokenParam, errorParam, googleLogin]);

    useEffect(() => {
        if (user) {
            if (user.role === "admin") navigate("/admin");
            else navigate("/dashboard");
        }
    }, [user, navigate]);

    // Derive the input type hint for UX
    const detectedType = identifier.length >= 10 && isMobileNumber(identifier)
        ? "mobile"
        : identifier.includes("@")
            ? "email"
            : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const userData = await login(identifier, password);
            navigate(userData.role === "admin" ? "/admin" : "/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };
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
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20 overflow-hidden p-1">
                            <img src="/logo.png" alt="SevaLink Logo" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Citizen Login</h1>
                        <p className="text-blue-200 text-sm mt-1 font-medium">SevaLink Public Portal</p>
                    </div>
                </div>

                {/* Form */}
                <div className="px-8 py-8">
                    {error && (
                        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm"
                            style={{ animation: "shake 0.3s ease-out" }}>
                            <span className="mt-0.5 shrink-0">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email or Mobile */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Email or Mobile Number
                                </label>
                                {detectedType && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-all
                                        ${detectedType === "mobile"
                                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                            : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                        {detectedType === "mobile"
                                            ? <><Phone size={11} /> Mobile</>
                                            : <><Mail size={11} /> Email</>
                                        }
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                {detectedType === "mobile"
                                    ? <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 transition-colors" />
                                    : <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                }
                                <input
                                    id="citizen-identifier"
                                    type="text"
                                    autoComplete="username"
                                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400
                                        ${detectedType === "mobile"
                                            ? "border-indigo-200 focus:ring-indigo-500/20"
                                            : "border-slate-200 focus:ring-blue-500/30"}`}
                                    placeholder="you@example.com or 9876543210"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                                Enter your email address or registered 10-digit mobile number
                            </p>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    id="citizen-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="citizen-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-300/50 hover:shadow-xl hover:shadow-blue-400/40 hover:-translate-y-0.5 text-sm tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : "Sign In"}
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
                        id="google-login-btn"
                        onClick={() => window.location.href = "https://server-gray-three-90.vercel.app/api/auth/google"}
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

                    {/* Footer links */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                            Create Account
                        </Link>
                    </p>

                    {/* Action Buttons for Worker & Admin */}
                    <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <Link to="/worker-login" className="flex flex-col items-center justify-center p-3 rounded-xl border border-orange-100 bg-orange-50 hover:bg-orange-100/70 text-orange-600 transition-colors group">
                            <span className="text-xl mb-1.5 group-hover:scale-110 transition-transform"><HardHat size={20} /></span>
                            <span className="text-xs font-semibold">Worker Portal</span>
                        </Link>
                        <Link to="/admin-login" className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-100 bg-purple-50 hover:bg-purple-100/70 text-purple-600 transition-colors group">
                            <span className="text-xl mb-1.5 group-hover:scale-110 transition-transform"><Shield size={20} /></span>
                            <span className="text-xs font-semibold">Admin Portal</span>
                        </Link>
                    </div>
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

export default Login;
