import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { MapPin, Upload, Loader, X, Camera, FileText, Navigation, CheckCircle, AlertCircle, ImageIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { saveRequestOffline } from "../utils/db";
import API_BASE_URL from "../config/api";

// Fix default marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ACCEPTED_FORMATS = ".jpg,.jpeg,.png,.webp,.gif,.svg";
const ACCEPTED_FORMATS_LABEL = "JPG, PNG, WebP, GIF, SVG";
const MAX_DESCRIPTION = 500;

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Recenter map component
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 15, { animate: true });
        }
    }, [lat, lng, map]);
    return null;
};

const RequestForm = ({ onRequestAdded }) => {
    const { user } = useAuth();
    const isOnline = useNetworkStatus();
    const fileInputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Other");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [location, setLocation] = useState({ latitude: null, longitude: null, address: "" });
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [successId, setSuccessId] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Image handling
    const handleImageSelect = useCallback((file) => {
        if (!file) return;

        const validExts = /\.(jpe?g|png|webp|gif|svg)$/i;
        if (!validExts.test(file.name) && !file.type.startsWith("image/")) {
            setError(`Invalid file type. Accepted formats: ${ACCEPTED_FORMATS_LABEL}`);
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // Increased to 10MB for modern photos
            setError("File size must be under 10MB.");
            return;
        }

        setError("");
        setImageLoading(true);

        try {
            setImage(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            setImageLoading(false);
        } catch (err) {
            console.error("Preview error:", err);
            setError("Failed to generate preview, but the file is selected.");
            setImageLoading(false);
        }
    }, []);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Drag & Drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageSelect(e.dataTransfer.files[0]);
        }
    };

    // Location handlers
    const handleMapClick = async (lat, lng) => {
        setLocation((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            if (response.data?.display_name) {
                setLocation({ latitude: lat, longitude: lng, address: response.data.display_name });
            }
        } catch {
            setLocation((prev) => ({ ...prev, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
        }
    };

    const getLocation = () => {
        setLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let address = "Pinned Location";
                    try {
                        const response = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        if (response.data?.display_name) {
                            address = response.data.display_name;
                        }
                    } catch {
                        // fallback
                    }
                    setLocation({ latitude, longitude, address });
                    setLocating(false);
                },
                () => {
                    setError("Could not get location. Please enable GPS.");
                    setLocating(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLocating(false);
        }
    };

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setLocation((prev) => ({ ...prev, address: value }));
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (value.length > 2) {
            debounceTimer.current = setTimeout(async () => {
                try {
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`
                    );
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                } catch {
                    // ignore
                }
            }, 500);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (s) => {
        setLocation({
            latitude: parseFloat(s.lat),
            longitude: parseFloat(s.lon),
            address: s.display_name,
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg("");
        setSuccessId("");
        setError("");

        if (!isOnline) {
            const offlineData = {
                title,
                description,
                category,
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || "Manual entry",
                image: image, // Store the file object in IndexedDB
                createdAt: new Date().toISOString(),
                status: "Pending Sync",
            };
            try {
                await saveRequestOffline(offlineData);
                setSuccessMsg("Saved offline! Your request and photo will sync when you are online.");
                toast.success("Saved offline! Will sync when connected.", { icon: "📵" });
                resetForm();
                if (onRequestAdded) onRequestAdded();
            } catch {
                setError("Failed to save offline.");
                toast.error("Failed to save offline.");
            } finally {
                setLoading(false);
            }
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        if (location.latitude) formData.append("latitude", location.latitude);
        if (location.longitude) formData.append("longitude", location.longitude);
        formData.append("address", location.address || "Manual entry");
        if (image) formData.append("image", image);

        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/requests`, formData, config);
            setSuccessMsg("Request submitted successfully!");
            setSuccessId(data._id);
            toast.success("Request submitted successfully! 🎉");
            resetForm();
            if (onRequestAdded) onRequestAdded();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit request");
            toast.error(err.response?.data?.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("Other");
        setImage(null);
        setImagePreview(null);
        setLocation({ latitude: null, longitude: null, address: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const categories = [
        { value: "Water", label: "💧 Water" },
        { value: "Electricity", label: "⚡ Electricity" },
        { value: "Health", label: "🏥 Health" },
        { value: "Roads", label: "🛣️ Roads" },
        { value: "Documents", label: "📄 Documents" },
        { value: "Other", label: "📌 Other" },
    ];

    const defaultCenter = [22.57, 88.36]; // Kolkata
    const mapCenter = location.latitude && location.longitude
        ? [location.latitude, location.longitude]
        : defaultCenter;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={22} /> Report an Issue
                </h2>
                <p className="text-blue-100 text-sm mt-1">Fill out the details below to submit a new service request</p>
            </div>

            {/* Error / Success Messages */}
            {error && (
                <div className="mx-6 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
            {successMsg && (
                <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-500" />
                        <span className="font-semibold">{successMsg}</span>
                    </div>
                    {successId && (
                        <p className="text-xs text-green-600 mt-1 ml-6">
                            Request ID: <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded">{successId}</span>
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* ─── Section 1: Issue Information ─── */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        Issue Information
                    </h3>

                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input
                                type="text"
                                placeholder="e.g., Broken Pipe on Main Road"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                placeholder="Provide details about the issue..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                value={description}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_DESCRIPTION) setDescription(e.target.value);
                                }}
                                rows={4}
                                required
                            />
                            <div className="flex justify-end mt-1">
                                <span className={`text-xs ${description.length >= MAX_DESCRIPTION ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                                    {description.length}/{MAX_DESCRIPTION}
                                </span>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* ─── Section 2: Location Selection ─── */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        Location Selection
                    </h3>

                    {/* Interactive Map */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-4 relative" style={{ height: "280px" }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={location.latitude ? 15 : 12}
                            scrollWheelZoom={true}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <MapClickHandler onLocationSelect={handleMapClick} />
                            {location.latitude && location.longitude && (
                                <>
                                    <Marker position={[location.latitude, location.longitude]} />
                                    <RecenterMap lat={location.latitude} lng={location.longitude} />
                                </>
                            )}
                        </MapContainer>
                        {!location.latitude && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
                                <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    Click on the map to set location
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GPS + Address Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={getLocation}
                            disabled={locating}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-all font-medium text-sm disabled:opacity-50 shrink-0"
                        >
                            {locating ? (
                                <Loader size={16} className="animate-spin" />
                            ) : (
                                <Navigation size={16} />
                            )}
                            {locating ? "Detecting..." : "Use My Location"}
                        </button>

                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search address or landmark..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={location.address}
                                onChange={handleAddressChange}
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-[600] w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    {suggestions.map((s) => (
                                        <li
                                            key={s.place_id}
                                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors"
                                            onClick={() => selectSuggestion(s)}
                                        >
                                            <MapPin size={12} className="inline mr-1.5 text-gray-400" />
                                            {s.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Selected coordinates */}
                    {location.latitude && location.longitude && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-100 animate-fade-in">
                            <MapPin size={14} />
                            <span className="font-medium">Location set:</span>
                            <span className="font-mono">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>
                        </div>
                    )}
                </section>

                <hr className="border-gray-100" />

                {/* ─── Section 3: Photo Evidence ─── */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        Photo Evidence
                        <span className="text-gray-400 font-normal normal-case text-xs ml-1">(optional)</span>
                    </h3>

                    {!imagePreview ? (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {imageLoading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader size={32} className="text-blue-500 animate-spin" />
                                    <p className="text-sm text-gray-500">Processing image...</p>
                                </div>
                            ) : (
                                <>
                                    <Camera size={36} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm font-medium text-gray-600">
                                        {dragActive ? "Drop your image here" : "Drag & drop or click to upload"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Accepted: {ACCEPTED_FORMATS_LABEL} · Max 5MB
                                    </p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) => handleImageSelect(e.target.files[0])}
                                className="hidden"
                                accept={ACCEPTED_FORMATS}
                            />
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-xl overflow-hidden animate-fade-in shadow-sm">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Upload size={14} className="text-gray-400 shrink-0" />
                                    <span className="text-sm text-gray-700 truncate">{image?.name}</span>
                                </div>
                                <span className="text-xs text-gray-400 shrink-0 ml-2">
                                    {(image?.size / 1024).toFixed(0)} KB
                                </span>
                            </div>
                        </div>
                    )}
                    {!isOnline && <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">ℹ️ You are offline. Photos will be saved and synced later.</p>}
                </section>

                <hr className="border-gray-100" />

                {/* ─── Submit Button ─── */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex justify-center items-center gap-2 font-semibold text-base shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        isOnline ? "Submit Request" : "Save for Later"
                    )}
                </button>
            </form>
        </div>
    );
};

export default RequestForm;
