import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            return setError("Password must be at least 6 characters long.");
        }

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        try {
            const res = await axios.post(`https://sevalink-zygf.vercel.app/api/auth/accept-invite/${token}`, { password });

            // On success, we set token in local storage and redirect to worker dashboard
            localStorage.setItem("user", JSON.stringify(res.data));
            setSuccess("Account activated successfully! Redirecting...");

            setTimeout(() => {
                navigate("/worker");
                window.location.reload();
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || "Failed to activate account. The link might be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border-t-8 border-blue-600">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🤝</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to SevaLink</h2>
                    <p className="text-gray-500 mt-2">Set your password to activate your Worker account</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-200">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 mt-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Activating..." : "Activate Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AcceptInvite;
