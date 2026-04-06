import React, { useEffect, useRef, useState } from "react";
type LatLng = { lat: number; lng: number };
type MapPickerProps = {
    initial?: LatLng;
    onPick?: (pos: { lat: number; lng: number }) => void;
    readOnly?: boolean;
};

export default function LeafletMapPicker({ initial = { lat: 34.0, lng: 9.0 }, onPick, readOnly = false }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<any>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'default' | 'satellite'>('default');
    useEffect(() => {
        let isMounted = true;
        const initMap = async () => {
            try {
                const L = await import('leaflet');
                if (typeof document !== 'undefined') {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
                    document.head.appendChild(link);
                }
                const customIcon = L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 0C7.163 0 0 7.163 0 16c0 10.667 16 26 16 26s16-15.333 16-26c0-8.837-7.163-16-16-16z" fill="#0EA5E9"/>
                            <circle cx="16" cy="16" r="6" fill="white"/>
                        </svg>
                    `),
                    iconSize: [24, 32],
                    iconAnchor: [12, 32],
                    popupAnchor: [0, -32],
                    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                    shadowSize: [30, 30]
                });
                if (!isMounted || !mapRef.current) return;
                const map = L.map(mapRef.current, {worldCopyJump: true, maxBounds: [[-90, -180], [90, 180]]}).setView([initial.lat, initial.lng], 13);
                mapInstanceRef.current = map;
                const defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {attribution: '', maxZoom: 18});
                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: '', maxZoom: 18});
                const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {attribution: '', maxZoom: 18});
                defaultLayer.addTo(map);
                (map as any)._layers = {default: defaultLayer, satellite: satelliteLayer, labels: labelsLayer};
                
                const marker = L.marker([initial.lat, initial.lng], { 
                    draggable: !readOnly, 
                    icon: customIcon
                }).addTo(map);
                
                markerRef.current = marker;
                (map as any)._marker = marker;
                
                if (!readOnly) {
                    map.on('click', (e: any) => {
                        const { lat, lng } = e.latlng;
                        marker.setLatLng([lat, lng]);
                        if (onPick) onPick({ lat, lng });
                    });
                    marker.on('dragend', () => {
                        const { lat, lng } = marker.getLatLng();
                        if (onPick) onPick({ lat, lng });
                    });
                }
                
                setIsLoading(false);
            } catch (error) {setIsLoading(false);}
        };
        initMap();
        return () => {
            isMounted = false;
            if (mapInstanceRef.current) {mapInstanceRef.current.remove();}
        };
    }, [readOnly]);
    const toggleView = () => {
        if (mapInstanceRef.current) {
            const map = mapInstanceRef.current;
            const layers = (map as any)._layers;
            const marker = (map as any)._marker || markerRef.current;
            const newMode = viewMode === 'default' ? 'satellite' : 'default';
            setViewMode(newMode);
            Object.values(layers).forEach((layer: any) => {if (map.hasLayer(layer)) {map.removeLayer(layer);}});
            if (newMode === 'satellite') {
                layers.satellite.addTo(map);
                layers.labels.addTo(map);
            } else {layers.default.addTo(map);}
            if (marker && !map.hasLayer(marker)) {marker.addTo(map);}
        }
    };
    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {isLoading && (<div style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000}}>Loading...</div>)}
            <div ref={mapRef} style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0"}} />
            <button onClick={toggleView} style={{position: "absolute", top: 8, right: 8, zIndex: 1000, padding: "4px 8px", backgroundColor: "white", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontSize: "10px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"}}>
                {viewMode === 'default' ? 'Satellite' : 'Map'}
            </button>
        </div>
    );
}