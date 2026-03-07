import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

const HeatMapLayer = ({ points }) => {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (!points || points.length === 0) return;

        // Ensure all coordinates are strictly floats
        const numericPoints = points.map(p => [
            parseFloat(p[0]),
            parseFloat(p[1]),
            p[2] !== undefined ? parseFloat(p[2]) : 1.0
        ]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));

        if (numericPoints.length === 0) return;

        console.log("HeatMap rendering points:", numericPoints);

        // Create the heat layer only once
        if (!heatLayerRef.current) {
            heatLayerRef.current = L.heatLayer(numericPoints, {
                radius: 35,
                blur: 20,
                maxZoom: 17,
                max: 1.0,  // Since backend sends intensity of 1
                gradient: {
                    0.2: "#0000ff",
                    0.4: "#00ffff",
                    0.6: "#00ff00",
                    0.8: "#ffff00",
                    1.0: "#ff0000",
                },
            });

            // Add with a tiny delay to ensure map container is completely stable
            setTimeout(() => {
                if (heatLayerRef.current && map) {
                    heatLayerRef.current.addTo(map);
                }
            }, 50);
        } else {
            // Update the points on subsequent renders
            heatLayerRef.current.setLatLngs(numericPoints);
        }

        // Cleanup on unmount
        return () => {
            if (map && heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
        };
    }, [map, points]);

    return null;
};

export default HeatMapLayer;
