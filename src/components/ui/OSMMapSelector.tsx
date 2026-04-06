"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
interface Location {
    lat: number;
    lng: number;
}
interface OSMMapSelectorProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
    className?: string;
}
const OSMMapSelector = ({ onLocationSelect, initialLocation, className = "" }: OSMMapSelectorProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualLat, setManualLat] = useState("");
    const [manualLng, setManualLng] = useState("");
    useEffect(() => {
        let isMounted = true;
        const initMap = () => {
            if (!isMounted || !mapRef.current) return;
            try {
                const defaultCenter = initialLocation || { lat: 34.0, lng: 9.0 };
                const mapContainer = mapRef.current;
                mapContainer.innerHTML = "";
                const iframe = document.createElement("iframe");
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "none";
                iframe.style.borderRadius = "0.5rem";
                iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${defaultCenter.lng - 0.01}%2C${defaultCenter.lat - 0.01}%2C${defaultCenter.lng + 0.01}%2C${defaultCenter.lat + 0.01}&layer=mapnik&marker=${defaultCenter.lat}%2C${defaultCenter.lng}`;
                mapContainer.appendChild(iframe);
                mapInstanceRef.current = iframe;
                setIsLoading(false);
            } catch (err) {
                if (isMounted) {
                    setError("Failed to initialize map");
                    setIsLoading(false);
                }
            }
        };
        const timer = setTimeout(() => {if (isMounted) {initMap();}}, 500);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [initialLocation, onLocationSelect]);
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                if (mapRef.current) {
                    mapRef.current.innerHTML = "";
                    const iframe = document.createElement("iframe");
                    iframe.style.width = "100%";
                    iframe.style.height = "100%";
                    iframe.style.border = "none";
                    iframe.style.borderRadius = "0.5rem";
                    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;
                    mapRef.current.appendChild(iframe);
                }
                onLocationSelect(location);
                setError(`Location captured! ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
                setTimeout(() => {if (error?.includes("Location captured")) {setError(null);}}, 3000);
            },
            (error) => {
                toast.error("Error getting location.");
                let errorMessage = "Unable to get your current location. ";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Permission denied. Please enable location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable. This often happens when GPS is disabled or you're using a VPN.";
                        setShowManualInput(true);
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred.";
                        setShowManualInput(true);
                        break;
                }
                setError(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };
    const handleManualSubmit = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (isNaN(lat) || isNaN(lng)) {
            setError("Please enter valid coordinates");
            return;
        }
        if (lat < -90 || lat > 90) {
            setError("Latitude must be between -90 and 90");
            return;
        }
        if (lng < -180 || lng > 180) {
            setError("Longitude must be between -180 and 180");
            return;
        }
        const location = { lat, lng };
        if (mapRef.current) {
            mapRef.current.innerHTML = "";
            const iframe = document.createElement("iframe");
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.style.borderRadius = "0.5rem";
            iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
            mapRef.current.appendChild(iframe);
        }
        onLocationSelect(location);
        setError(`Location set manually! ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setManualLat("");
        setManualLng("");
        setShowManualInput(false);
        setTimeout(() => {if (error?.includes("Location set manually")) {setError(null);}}, 3000);
    };
    if (error && (error.includes("Location captured") || error.includes("Location set manually"))) {return <div className={`border rounded-lg p-4 text-center text-green-600 ${className}`}>{error}</div>;}
    return (
        <div className={className}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Select Location on Map</h3>
                <div className="flex gap-2"><button type="button" onClick={handleGetCurrentLocation} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Navigation size={14} />Use Current Location</button></div>
            </div>
            {isLoading && <div className="border rounded-lg p-8 text-center text-gray-500">Loading map...</div>}
            <div ref={mapRef} className={`w-full h-64 rounded-lg border ${isLoading ? "hidden" : "block"}`} style={{ minHeight: "250px" }} />
            {error && !error.includes("Location captured") && !error.includes("Location set manually") && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                    {!showManualInput && (<button onClick={() => setShowManualInput(true)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline">Enter coordinates manually</button>)}
                </div>
            )}
            {showManualInput && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Enter Coordinates Manually</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                            <Input type="number" step="any" placeholder="34.000000" value={manualLat} onChange={(e) => setManualLat(e.target.value)} className="text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                            <Input type="number" step="any" placeholder="9.000000" value={manualLng} onChange={(e) => setManualLng(e.target.value)} className="text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button onClick={handleManualSubmit} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Set Location</button>
                        <button
                            onClick={() => {
                                setShowManualInput(false);
                                setManualLat("");
                                setManualLng("");
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">You can find coordinates by right-clicking on Google Maps and selecting "What's here?"</p>
                </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Map showing location. Use buttons above to set your position.</p>
        </div>
    );
};
export default OSMMapSelector;