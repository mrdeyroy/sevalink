import { MapPin, Clock, CheckCircle, AlertCircle, User } from "lucide-react";

const RequestList = ({ requests }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "bg-red-100 text-red-800";
            case "Assigned": return "bg-blue-100 text-blue-800";
            case "In Progress": return "bg-yellow-100 text-yellow-800";
            case "Resolved": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Open": return <AlertCircle size={16} className="mr-1" />;
            case "Assigned": return <User size={16} className="mr-1" />;
            case "In Progress": return <Clock size={16} className="mr-1" />;
            case "Resolved": return <CheckCircle size={16} className="mr-1" />;
            default: return null;
        }
    };

    if (!requests || requests.length === 0) {
        return <div className="text-center text-gray-500 mt-8">No requests found. Start by creating one!</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    {request.imageUrl && (
                        <img
                            src={`https://server-gray-three-90.vercel.app${request.imageUrl}`}
                            alt={request.title}
                            className="w-full h-48 object-cover"
                        />
                    )}
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{request.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>
                        <div className="flex items-center text-gray-500 text-xs">
                            <MapPin size={14} className="mr-1" />
                            {request.location?.address || "Location Pinned"}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RequestList;
