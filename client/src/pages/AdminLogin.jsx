import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Phone, Lock, Eye, EyeOff, Shield, HardHat } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

// Detect if string looks like a 10-digit Indian mobile number
const isMobileNumber = (val) => /^[6-9]\d{9}$/.test(val.trim());

const AdminLogin = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === "admin") {
            navigate("/admin");
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
            if (userData.role !== "admin") {
                setError("Access denied: Not an administrator account.");
            } else {
                navigate("/admin");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout gradient="from-slate-50 via-purple-50 to-indigo-50">
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-purple-100/40 border border-slate-100 overflow-hidden"
                style={{ animation: "fadeSlideUp 0.35s ease-out both" }}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-purple-700 to-purple-800 px-8 pt-10 pb-8 text-center overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5" />

                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-900/20">
                            <Shield size={26} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
                        <p className="text-purple-200 text-sm mt-1 font-medium">SevaLink Administration</p>
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
                        {/* Email / Mobile */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">Email or Mobile Number</label>
                                {detectedType && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-all
                                        ${detectedType === "mobile"
                                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                            : "bg-purple-50 text-purple-600 border border-purple-100"}`}>
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
                                    : <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                }
                                <input
                                    id="admin-identifier"
                                    type="text"
                                    autoComplete="username"
                                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-purple-500 transition-all shadow-sm placeholder:text-slate-400
                                        ${detectedType === "mobile"
                                            ? "border-indigo-200 focus:ring-indigo-500/20"
                                            : "border-slate-200 focus:ring-purple-500/30"}`}
                                    placeholder="admin@sevalink.com"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm placeholder:text-slate-400"
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
                            id="admin-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-purple-500 to-purple-800 hover:from-purple-600 hover:to-purple-900 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-300/50 hover:shadow-xl hover:shadow-purple-400/40 hover:-translate-y-0.5 text-sm tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating…
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    {/* Info note */}
                    <div className="mt-6 p-3.5 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 text-center leading-relaxed">
                        Restricted Access. This area is for<br />
                        authorized administrators only.
                    </div>

                    {/* Portal Shortcuts */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                        >
                            <Shield size={15} className="shrink-0" />
                            Citizen Portal
                        </Link>
                        <Link
                            to="/worker-login"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                        >
                            <HardHat size={15} className="shrink-0" />
                            Worker Portal
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

export default AdminLogin;
