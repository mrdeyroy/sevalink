import { useState } from "react";
import { X, UserPlus } from "lucide-react";

const CreateWorkerModal = ({ isOpen, onClose, onCreateWorker }) => {
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onCreateWorker(name, mobile, tempPassword);
        setLoading(false);
        setName("");
        setMobile("");
        setTempPassword("");
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Create Worker Account</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 text-sm text-blue-700">
                        The worker will log in using their <strong>mobile number</strong> and the temporary password you set. They will be asked to change it on first login.
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                id="worker-name-input"
                                type="text"
                                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Ramesh Kumar"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <input
                                id="worker-mobile-input"
                                type="tel"
                                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="e.g. 9876543210"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                            <input
                                id="worker-temppassword-input"
                                type="text"
                                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                placeholder="Set a temporary password (min. 6 chars)"
                                minLength={6}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Share this with the worker. They'll change it on first login.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            id="create-worker-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition"
                        >
                            {loading ? "Creating..." : <><UserPlus size={18} /> Create Worker</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkerModal;
