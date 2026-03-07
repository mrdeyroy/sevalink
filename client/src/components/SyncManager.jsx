import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { getOfflineRequests, deleteOfflineRequest } from "../utils/db";

const SyncManager = ({ onSyncComplete }) => {
    const isOnline = useNetworkStatus();
    const { user } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const syncRequests = async () => {
            if (isOnline && user && !isSyncing) {
                const offlineRequests = await getOfflineRequests();

                if (offlineRequests.length > 0) {
                    setIsSyncing(true);
                    window.dispatchEvent(new Event("sync-start"));
                    console.log(`Starting sync for ${offlineRequests.length} requests...`);

                    let syncedCount = 0;

                    for (const req of offlineRequests) {
                        try {
                            const formData = new FormData();
                            Object.keys(req).forEach(key => {
                                if (key === "id") return; // Don't send the IndexedDB ID
                                if (req[key]) formData.append(key, req[key]);
                            });

                            const config = {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                    Authorization: `Bearer ${user.token}`,
                                },
                            };

                            await axios.post("https://sevalink-zygf.vercel.app/api/requests", formData, config);
                            await deleteOfflineRequest(req.id);
                            syncedCount++;
                        } catch (error) {
                            console.error(`Failed to sync request ${req.id}:`, error);
                            // Keep in DB to retry later
                        }
                    }

                    setIsSyncing(false);
                    window.dispatchEvent(new CustomEvent("sync-end", { detail: { count: syncedCount } }));
                    console.log("Sync process finished.");

                    if (syncedCount > 0 && onSyncComplete) {
                        onSyncComplete();
                    }
                }
            }
        };

        syncRequests();

        // Optional: Set up an interval to retry if online but previous attempts failed
        const intervalId = setInterval(() => {
            if (isOnline && !isSyncing) syncRequests();
        }, 30000); // Retry every 30 seconds

        return () => clearInterval(intervalId);

    }, [isOnline, user, onSyncComplete, isSyncing]);

    return null;
};

export default SyncManager;
