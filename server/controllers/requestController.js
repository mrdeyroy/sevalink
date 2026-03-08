import Request from "../models/Request.js";
import User from "../models/User.js";

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
    console.log("[CreateRequest] Body:", req.body);
    try {
        const { title, description, category, latitude, longitude, address } =
            req.body;
        let imageUrl = "";

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            console.log("[CreateRequest] Image uploaded:", imageUrl);
        }

        // Generate complaint ID: SVL-YYYY-XXXX
        const year = new Date().getFullYear();
        const lastRequest = await Request.findOne({ complaintId: new RegExp(`^SVL-${year}-`) }).sort({ complaintId: -1 });
        let nextSeq = 1;
        if (lastRequest && lastRequest.complaintId) {
            const parts = lastRequest.complaintId.split('-');
            if (parts.length === 3) {
                nextSeq = parseInt(parts[2], 10) + 1;
            }
        }
        const seq = String(nextSeq).padStart(4, "0");
        const complaintId = `SVL-${year}-${seq}`;
        console.log("[CreateRequest] Generated ID:", complaintId);

        const request = new Request({
            complaintId,
            title,
            description,
            category,
            imageUrl,
            location: {
                latitude: (latitude !== undefined && latitude !== null && latitude !== "") ? Number(latitude) : undefined,
                longitude: (longitude !== undefined && longitude !== null && longitude !== "") ? Number(longitude) : undefined,
                address,
            },
            createdBy: req.user._id,
            timeline: [
                { action: "Request Submitted", timestamp: new Date(), details: `Complaint ${complaintId} created by citizen` },
            ],
        });

        const createdRequest = await request.save();
        console.log("[CreateRequest] Saved successfully:", createdRequest.complaintId);
        res.status(201).json(createdRequest);
    } catch (error) {
        console.error("[CreateRequest] ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === "admin") {
            requests = await Request.find()
                .populate("createdBy", "name email mobile")
                .populate("assignedTo", "name email mobile workerId status")
                .populate("reviewedBy", "name");
        } else if (req.user.role === "worker") {
            requests = await Request.find({ assignedTo: req.user._id })
                .populate("createdBy", "name email mobile")
                .populate("reviewedBy", "name");
        } else {
            // Citizen: populate assignedTo so they can see their worker's info
            requests = await Request.find({ createdBy: req.user._id })
                .populate("assignedTo", "name mobile workerId status")
                .populate("reviewedBy", "name");
        }
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate("createdBy", "name email mobile")
            .populate("assignedTo", "name email mobile workerId status")
            .populate("completedByWorkerId", "name workerId")
            .populate("reviewedBy", "name");

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Apply role-based access control for viewing the request
        if (req.user.role === "worker") {
            if (!request.assignedTo || request.assignedTo._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Not authorized to view this request" });
            }
        } else if (req.user.role === "citizen") {
            if (!request.createdBy || request.createdBy._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Not authorized to view this request" });
            }
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (worker/admin)
// @route   PUT /api/requests/:id/status
// @access  Private (Worker/Admin)
export const updateRequestStatus = async (req, res) => {
    try {
        const { status, priority } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (status) request.status = status;
        if (priority) request.priority = priority;

        // Push timeline event
        if (status === "In Progress") {
            request.timeline.push({ action: "Work Started", timestamp: new Date(), details: "Worker has started working on this issue" });
        }

        // If resolving, record completion metadata
        if (status === "Resolved") {
            const now = new Date();

            request.completedAt = now;
            request.resolvedAt = now;

            // Calculate resolution time in hours
            if (request.createdAt) {
                const diffTime = Math.abs(now - request.createdAt);
                request.resolutionTime = diffTime / (1000 * 60 * 60);
            }

            if (req.user.role === "worker") {
                request.completedByWorkerId = req.user._id;
            }

            // Handle proof image upload
            if (req.file) {
                request.proofImage = `/uploads/${req.file.filename}`;
            }

            request.timeline.push({ action: "Work Completed", timestamp: now, details: "Issue has been resolved" });
        }

        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign worker
// @route   PUT /api/requests/:id/assign
// @access  Private (Admin)
export const assignWorker = async (req, res) => {
    try {
        const { workerId } = req.body;
        console.log(`[AssignWorker] Request ID: ${req.params.id}, Worker ID: ${workerId}`);

        const request = await Request.findById(req.params.id);

        if (request) {
            request.assignedTo = workerId;
            request.status = "Assigned"; // Auto update status
            request.timeline.push({ action: "Worker Assigned", timestamp: new Date(), details: "A worker has been assigned to this issue" });
            const updatedRequest = await request.save();
            res.json(updatedRequest);
        } else {
            res.status(404).json({ message: "Request not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a review for a completed request (citizen only)
// @route   POST /api/requests/:id/review
// @access  Private (Citizen)
export const submitReview = async (req, res) => {
    try {
        const { rating, reviewText } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        // Only the citizen who created this request can review it
        if (request.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only review your own requests." });
        }

        if (request.status !== "Resolved") {
            return res.status(400).json({ message: "You can only review completed requests." });
        }

        if (request.rating) {
            return res.status(400).json({ message: "You have already reviewed this request." });
        }

        request.rating = Number(rating);
        request.reviewText = reviewText?.trim() || "";
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();

        const updated = await request.save();
        res.json({ message: "Review submitted successfully.", request: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
