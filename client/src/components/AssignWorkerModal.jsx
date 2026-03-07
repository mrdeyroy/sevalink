import { useState } from "react";
import { X } from "lucide-react";

const AssignWorkerModal = ({ isOpen, onClose, workers, onAssign }) => {
    const [selectedWorker, setSelectedWorker] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedWorker) {
            onAssign(selectedWorker);
            setSelectedWorker("");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[3000] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Assign Worker</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2 font-medium">Select a Worker</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedWorker}
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Worker --</option>
                            {workers.map((worker) => (
                                <option key={worker._id} value={worker._id}>
                                    {worker.name} ({worker.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            disabled={!selectedWorker}
                        >
                            Assign Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignWorkerModal;
