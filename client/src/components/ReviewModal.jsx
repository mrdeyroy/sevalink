import { useState } from "react";
import { X, Star, Send } from "lucide-react";

const ReviewModal = ({ isOpen, onClose, onSubmit, requestTitle, loading }) => {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [review, setReview] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!rating) {
            alert("Please select a star rating.");
            return;
        }
        onSubmit(rating, review);
    };

    const handleClose = () => {
        setRating(0);
        setHovered(0);
        setReview("");
        onClose();
    };

    const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{ animation: "scaleIn 0.2s ease-out" }}>

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold">Rate the Service</h2>
                            <p className="text-amber-100 text-sm mt-0.5 line-clamp-1">
                                {requestTitle}
                            </p>
                        </div>
                        <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors p-1">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Star Rating */}
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700 mb-3">How satisfied are you with the service?</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        size={36}
                                        className={`transition-colors ${star <= (hovered || rating)
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-slate-200 fill-slate-200"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hovered || rating) > 0 && (
                            <p className={`text-sm font-semibold mt-2 transition-all ${(hovered || rating) >= 4 ? "text-green-600" :
                                    (hovered || rating) >= 3 ? "text-amber-600" : "text-red-500"
                                }`}>
                                {ratingLabels[hovered || rating]}
                            </p>
                        )}
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">
                            Write a Review <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm resize-none placeholder:text-slate-400"
                            placeholder="Share your experience with the worker..."
                            rows={3}
                            maxLength={300}
                            value={review}
                            onChange={e => setReview(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 text-right mt-1">{review.length}/300</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !rating}
                            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                            ) : (
                                <><Send size={14} /> Submit Review</>
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

export default ReviewModal;
