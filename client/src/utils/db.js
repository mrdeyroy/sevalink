import { openDB } from "idb";

const DB_NAME = "SevaLinkDB";
const STORE_NAME = "requests";

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        },
    });
};

export const saveRequestOffline = async (requestData) => {
    const db = await initDB();
    return db.add(STORE_NAME, requestData);
};

export const getOfflineRequests = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const clearOfflineRequests = async () => {
    const db = await initDB();
    return db.clear(STORE_NAME);
};

export const deleteOfflineRequest = async (id) => {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
}
