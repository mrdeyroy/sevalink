import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import HeatMapLayer from './HeatMapLayer';
import { useState } from 'react';
import API_BASE_URL from "../config/api";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ requests, heatPoints, zoom = 5 }) => {
    const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'

    // Default center (India)
    const defaultCenter = [20.5937, 78.9629];

    // Find first request with location to center map, or use default
    const validRequest = requests.find(r => r.location?.latitude && r.location?.longitude);
    const center = validRequest
        ? [validRequest.location.latitude, validRequest.location.longitude]
        : defaultCenter;

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden shadow-md z-0">
            {heatPoints && heatPoints.length > 0 && (
                <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md border p-1 flex">
                    <button
                        onClick={() => setViewMode('markers')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'markers' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Markers
                    </button>
                    <button
                        onClick={() => setViewMode('heatmap')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'heatmap' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Heatmap
                    </button>
                </div>
            )}
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {viewMode === 'heatmap' && heatPoints && heatPoints.length > 0 && (
                    <HeatMapLayer points={heatPoints} />
                )}

                {viewMode === 'markers' && requests.map((request) => (
                    request.location?.latitude && request.location?.longitude && (
                        <Marker
                            key={request._id}
                            position={[request.location.latitude, request.location.longitude]}
                        >
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h3 className="font-bold text-sm">{request.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${request.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                        request.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                            request.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {request.status}
                                    </span>
                                    <img
                                        src={(!request.imageUrl || request.imageUrl.startsWith("http")) ? "/citizen_issue.png" : `${API_BASE_URL}${request.imageUrl}`}
                                        alt="Preview"
                                        className="w-full h-20 object-cover mt-2 rounded"
                                        onError={(e) => { e.currentTarget.src = "/citizen_issue.png"; }}
                                    />
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
