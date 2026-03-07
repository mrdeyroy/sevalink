import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { changePassword, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            return setError("New passwords do not match.");
        }
        if (newPassword.length < 8 || !/\d/.test(newPassword)) {
            return setError("New password must be at least 8 characters and contain at least one number.");
        }
        if (newPassword === currentPassword) {
            return setError("New password must be different from your current password.");
        }

        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            // Force re-login with new password so token reflects clean state
            logout();
            navigate("/worker-login?changed=true");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to change password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-center">
                        <div className="flex justify-center mb-3">
                            <div className="bg-white/20 p-3 rounded-full">
                                <ShieldCheck size={32} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                        <p className="text-orange-100 text-sm mt-1">You must change your password before continuing</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-8">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-6 text-sm text-orange-700">
                            🔐 Your admin set a temporary password for you. Please set a new personal password to secure your account.
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Current (Temporary) Password
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="current-password"
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                        placeholder="Your temporary password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="new-password"
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                        placeholder="Min 8 chars, include a number"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Min 8 characters · Must include at least one number</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                id="change-password-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
                            >
                                {loading ? "Saving..." : "Set New Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
