"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Fix Leaflet default marker icon in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component that re-centres the map whenever coords change
const MapCentre = ({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], zoom, { animate: true });
    }, [map, lat, lng, zoom]);
    return null;
};

export interface MapProps {
    /** Street address */
    address?: string;
    /** Municipality / city name */
    municipality?: string;
    /** Governorate / state name */
    governorate?: string;
    /** Country name */
    country?: string;
    /** ZIP / postal code */
    zipCode?: string;
    /** Company / location display name shown in marker popup */
    locationName?: string;
}

// Nominatim geocoding – free, no API key required
async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: { 'Accept-Language': 'fr,en-US,en;q=0.5', 'User-Agent': 'AxiaEventsApp/1.0' },
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
    } catch {
        return null;
    }
}

// Build the best geocoding query from least → most specific, falling back gracefully
function buildQueries(props: MapProps): string[] {
    const { address, municipality, governorate, country, zipCode } = props;
    const queries: string[] = [];
    const countrySuffix = country || 'Tunisia';

    // Full address – most precise
    const fullParts = [address, municipality, zipCode ? zipCode : undefined, governorate, countrySuffix].filter(Boolean);
    if (fullParts.length > 1) queries.push(fullParts.join(', '));

    // Street and City
    const streetCity = [address, municipality, countrySuffix].filter(Boolean);
    if (streetCity.length > 1) queries.push(streetCity.join(', '));

    // Without street
    const noStreet = [municipality, zipCode ? zipCode : undefined, governorate, countrySuffix].filter(Boolean);
    if (noStreet.length > 1) queries.push(noStreet.join(', '));

    // City + country only
    const cityCountry = [municipality || governorate, countrySuffix].filter(Boolean);
    if (cityCountry.length > 0) queries.push(cityCountry.join(', '));

    // Country last resort
    queries.push(countrySuffix);

    return queries;
}

// Tunisian default – Tunis centre, zoom 7
const TUNIS_DEFAULT = { lat: 36.8065, lng: 10.1815, zoom: 7 };

const Map = (props: MapProps) => {
    const t = useTranslations('MapSection');
    const [isMounted, setIsMounted] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [geocoding, setGeocoding] = useState(false);
    const [resolvedName, setResolvedName] = useState('');

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!isMounted) return;

        const hasAddress = props.address || props.municipality || props.governorate || props.country;
        if (!hasAddress) {
            setCoords(null);
            return;
        }

        // Build display name for popup
        const nameParts = [props.locationName, props.address, props.municipality, props.governorate].filter(Boolean);
        setResolvedName(nameParts[0] || props.municipality || props.governorate || '');

        const runGeocode = async () => {
            setGeocoding(true);
            const queries = buildQueries(props);
            for (const q of queries) {
                const result = await geocode(q);
                if (result) {
                    setCoords(result);
                    setGeocoding(false);
                    return;
                }
            }
            // All queries failed – use map default from Tunisia
            setCoords(null);
            setGeocoding(false);
        };

        runGeocode();
    }, [isMounted, props.address, props.municipality, props.governorate, props.country, props.zipCode]);

    // Determine what to show on the map
    const centre = coords ?? TUNIS_DEFAULT;
    const zoom = coords ? 14 : TUNIS_DEFAULT.zoom;

    if (!isMounted) {
        return (
            <div className="w-full h-[400px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
        );
    }

    if (geocoding) {
        return (
            <div className="w-full h-[400px] bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-3 border border-slate-200">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-slate-400">{t('locating')}</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={[centre.lat, centre.lng]}
            zoom={zoom}
            className="w-full h-[400px] rounded-xl z-0"
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Re-centre whenever coords resolve */}
            <MapCentre lat={centre.lat} lng={centre.lng} zoom={zoom} />

            {/* Marker — only when we have real geocoded coordinates */}
            {coords && (
                <Marker position={[coords.lat, coords.lng]}>
                    <Popup className="font-sans">
                        <div className="flex items-start gap-2 min-w-[160px]">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                {resolvedName && (
                                    <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{resolvedName}</p>
                                )}
                                {props.address && (
                                    <p className="text-slate-500 text-xs">{props.address}</p>
                                )}
                                {(props.municipality || props.governorate) && (
                                    <p className="text-slate-400 text-xs">
                                        {[props.municipality, props.governorate, props.country].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Map label overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md z-[1000] border border-slate-200 pointer-events-none">
                <span className="text-slate-700 font-bold text-sm">{t('title')}</span>
            </div>
        </MapContainer>
    );
};

export default Map;