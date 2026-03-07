import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import useNetworkStatus from "../hooks/useNetworkStatus";

const OfflineIndicator = () => {
    const isOnline = useNetworkStatus();
    const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, complete

    useEffect(() => {
        const handleSyncStart = () => setSyncStatus("syncing");
        const handleSyncEnd = (e) => {
            setSyncStatus("complete");
            setTimeout(() => setSyncStatus("idle"), 3000); // Hide after 3 seconds
        };

        window.addEventListener("sync-start", handleSyncStart);
        window.addEventListener("sync-end", handleSyncEnd);

        return () => {
            window.removeEventListener("sync-start", handleSyncStart);
            window.removeEventListener("sync-end", handleSyncEnd);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="bg-yellow-500 text-white text-center py-2 fixed bottom-0 w-full z-50 flex justify-center items-center shadow-lg animate-slide-up">
                <WifiOff size={18} className="mr-2" />
                <span className="font-medium">You are currently offline. Requests will be saved locally.</span>
            </div>
        );
    }

    if (syncStatus === "syncing") {
        return (
            <div className="bg-blue-600 text-white text-center py-2 fixed bottom-0 w-full z-50 flex justify-center items-center shadow-lg animate-slide-up">
                <RefreshCw size={18} className="mr-2 animate-spin" />
                <span className="font-medium">Restored connection. Syncing offline requests...</span>
            </div>
        );
    }

    if (syncStatus === "complete") {
        return (
            <div className="bg-green-600 text-white text-center py-2 fixed bottom-0 w-full z-50 flex justify-center items-center shadow-lg animate-slide-up">
                <CheckCircle size={18} className="mr-2" />
                <span className="font-medium">Sync Complete. All requests uploaded.</span>
            </div>
        );
    }

    return null;
};

export default OfflineIndicator;
