import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { User, Camera, Trash2, Save, ArrowLeft, CheckCircle } from "lucide-react";

const ProfileSettings = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [name, setName] = useState(user?.name || "");
    const [preview, setPreview] = useState(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be under 2 MB.");
            return;
        }
        setAvatarFile(file);
        setRemoveAvatar(false);
        setPreview(URL.createObjectURL(file));
        setError("");
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setRemoveAvatar(true);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            if (removeAvatar) formData.append("removeAvatar", "true");
            if (avatarFile) formData.append("avatar", avatarFile);

            await updateProfile(formData);
            setSuccess(true);
            setAvatarFile(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const initials = user?.name ? user.name.charAt(0).toUpperCase() : "?";
    const roleColors = {
        admin: "from-purple-500 to-purple-600",
        worker: "from-orange-500 to-orange-600",
        citizen: "from-blue-500 to-blue-600",
    };
    const gradient = roleColors[user?.role] || roleColors.citizen;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm text-gray-700 font-medium">Profile Settings</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header band */}
                    <div className={`bg-gradient-to-r ${gradient} px-8 py-6`}>
                        <h1 className="text-xl font-bold text-white">Profile Settings</h1>
                        <p className="text-white/70 text-sm mt-0.5">
                            Update your name and profile picture
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Avatar section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile"
                                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center border-4 border-white shadow-lg`}>
                                        <span className="text-4xl font-bold text-white">{initials}</span>
                                    </div>
                                )}
                                {/* Camera overlay */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition"
                                    title="Change photo"
                                >
                                    <Camera size={15} className="text-gray-600" />
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    {preview ? "Change photo" : "Upload photo"}
                                </button>
                                {preview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="text-sm px-4 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition flex items-center gap-1.5"
                                    >
                                        <Trash2 size={13} /> Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP · Max 2 MB</p>
                        </div>

                        <hr className="border-gray-100 mb-7" />

                        {/* Name field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Read-only info */}
                        <div className="mb-6 grid grid-cols-2 gap-4">
                            {user?.email && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 truncate">{user.email}</p>
                                </div>
                            )}
                            {user?.mobile && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mobile</label>
                                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">{user.mobile}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 capitalize">{user?.role}</p>
                            </div>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                <CheckCircle size={16} /> Profile updated successfully!
                            </div>
                        )}

                        <button
                            id="save-profile-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                            {loading ? "Saving..." : <><Save size={17} /> Save Changes</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
