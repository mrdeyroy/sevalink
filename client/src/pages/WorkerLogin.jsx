import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff, HardHat, Shield } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const WorkerLogin = () => {
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { workerLogin, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === "worker" && !user.mustChangePassword) {
            navigate("/worker");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await workerLogin(mobile, password);
            if (data.mustChangePassword) {
                navigate("/change-password");
            } else {
                navigate("/worker");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout gradient="from-slate-50 via-orange-50 to-amber-50">
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-orange-100/40 border border-slate-100 overflow-hidden"
                style={{ animation: "fadeSlideUp 0.35s ease-out both" }}>

                {/* Header */}
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-8 pt-10 pb-8 text-center overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5" />

                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-900/20">
                            <HardHat size={26} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Worker Portal</h1>
                        <p className="text-orange-200 text-sm mt-1 font-medium">SevaLink Field Operations</p>
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
                        {/* Mobile */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                            <div className="relative group">
                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    id="worker-mobile"
                                    type="tel"
                                    autoComplete="tel"
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all shadow-sm placeholder:text-slate-400"
                                    placeholder="Enter your mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    id="worker-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all shadow-sm placeholder:text-slate-400"
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
                            id="worker-login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/40 hover:-translate-y-0.5 text-sm tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    {/* Info note */}
                    <div className="mt-6 p-3.5 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700 text-center leading-relaxed">
                        Your account is managed by your admin.<br />
                        Contact your supervisor if you need access.
                    </div>

                    {/* Citizen Portal shortcut */}
                    <div className="mt-6">
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                        >
                            <Shield size={15} className="shrink-0" />
                            Citizen Portal
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

export default WorkerLogin;
