// frontend/src/components/ISSTracker.jsx
// Real-time ISS position tracker using Leaflet.
// Features:
//   - Dark-styled map with custom ISS icon
//   - Position updated every 5 seconds via the open-notify public API
//   - Light Pollution overlay toggle using NASA VIIRS Night Lights tiles (no API key required)

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from './Icon';

// ── ISS SVG icon as a Base64 data URI ─────────────────────────────────────────
const ISS_ICON_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"
  fill="none" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12.25 2.042a9.98 9.98 0 0 1 7.71 7.71 9.98 9.98 0 0 1-7.71 7.71 9.98 9.98 0 0 1-7.71-7.71A9.98 9.98 0 0 1 12.25 2.042Z"/>
  <path d="m7 12 5 5"/><path d="m12.5 6.9-1 1"/><path d="m6.5 12.5-1 1"/>
  <path d="M12 22v-2"/><path d="M22 12h-2"/><path d="m18 18-1-1"/><path d="m6 6-1-1"/>
</svg>
`)}`;

// NASA VIIRS Black Marble Night Lights — free, no API key required
const LIGHT_POLLUTION_TILE_URL =
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble_2016c/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg';

const ISSTracker = () => {
    const mapContainerRef = useRef(null);
    const mapRef          = useRef(null);
    const markerRef       = useRef(null);
    const pollutionRef    = useRef(null); // Leaflet TileLayer for light pollution

    const [issInfo,       setIssInfo]       = useState('Fetching ISS position…');
    const [showPollution, setShowPollution] = useState(false);

    // ── Map initialization (once) ──────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Base map
        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);
        mapRef.current = map;

        // ISS marker
        const issIcon = L.icon({ iconUrl: ISS_ICON_SVG, iconSize: [44, 44], iconAnchor: [22, 22] });
        markerRef.current = L.marker([0, 0], { icon: issIcon }).addTo(map);

        // Light pollution overlay (added but not shown until toggle)
        pollutionRef.current = L.tileLayer(LIGHT_POLLUTION_TILE_URL, {
            attribution: 'NASA GIBS · VIIRS Night Lights',
            opacity: 0.65,
        });

        // ISS position polling
        const fetchISS = async () => {
            try {
                const res  = await fetch('https://api.open-notify.org/iss-now.json');
                const data = await res.json();
                if (data.message === 'success') {
                    const lat = parseFloat(data.iss_position.latitude);
                    const lon = parseFloat(data.iss_position.longitude);
                    markerRef.current.setLatLng([lat, lon]);
                    mapRef.current.panTo([lat, lon], { animate: true, duration: 1 });
                    setIssInfo(`Lat: ${lat.toFixed(2)}°  ·  Lon: ${lon.toFixed(2)}°`);
                }
            } catch {
                setIssInfo('Unable to fetch ISS position');
            }
        };

        fetchISS();
        const interval = setInterval(fetchISS, 5000);
        return () => clearInterval(interval);
    }, []);

    // ── Light Pollution Toggle ────────────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || !pollutionRef.current) return;

        if (showPollution) {
            pollutionRef.current.addTo(mapRef.current);
        } else {
            pollutionRef.current.remove();
        }
    }, [showPollution]);

    return (
        <div className="glass-card p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon type="flyover" />
                    ISS Live Tracker
                </h2>
                <button
                    onClick={() => setShowPollution((p) => !p)}
                    title="Toggle NASA Night Lights layer to find dark sky sites"
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                        showPollution
                            ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                            : 'bg-gray-700/40 border-gray-600/40 text-gray-400 hover:text-white'
                    }`}
                >
                    {showPollution ? '💡 Night Lights: ON' : '🌑 Night Lights'}
                </button>
            </div>

            {/* Map */}
            <div
                ref={mapContainerRef}
                id="issMap"
                style={{ height: '280px', width: '100%' }}
                className="rounded-xl overflow-hidden border border-white/10"
            />

            {/* Position readout */}
            <p className="text-center mt-3 text-indigo-300/80 text-xs font-mono tracking-wider">
                {issInfo}
            </p>
        </div>
    );
};

export default ISSTracker;
