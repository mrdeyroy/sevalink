import { useState, useRef } from "react";
import { Upload, X, CheckCircle, Image as ImageIcon } from "lucide-react";

const UploadProofModal = ({ isOpen, onClose, onConfirm, taskTitle, loading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("File must be less than 5MB.");
            return;
        }
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleConfirm = () => {
        if (!selectedFile) {
            alert("Please upload a proof photo to mark this task as resolved.");
            return;
        }
        onConfirm(selectedFile);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{ animation: "scaleIn 0.2s ease-out" }}>

                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold">Upload Proof Photo</h2>
                            <p className="text-green-100 text-sm mt-0.5 line-clamp-1">
                                Task: {taskTitle}
                            </p>
                        </div>
                        <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors p-1">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                        A photo proof is required to mark this task as <strong>Resolved</strong>. Please upload a clear photo showing the completed work.
                    </p>

                    {/* Drop zone */}
                    {!preview ? (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                                    ? "border-green-500 bg-green-50"
                                    : "border-slate-200 hover:border-green-400 hover:bg-green-50/50"
                                }`}
                        >
                            <ImageIcon size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-600">Click or drag & drop a photo</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleFileChange(e.target.files[0])}
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-slate-200" />
                            <button
                                onClick={() => { setSelectedFile(null); setPreview(null); }}
                                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-slate-500 hover:text-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
                                <CheckCircle size={16} />
                                {selectedFile?.name}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || !selectedFile}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                            ) : (
                                <><Upload size={16} /> Mark as Resolved</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default UploadProofModal;
