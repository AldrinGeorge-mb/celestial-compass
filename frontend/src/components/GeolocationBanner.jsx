// frontend/src/components/GeolocationBanner.jsx
// First-load geolocation onboarding banner.
// Prompts the user to share their location for personalized sky events.
// Non-blocking: the user can dismiss it and use the search box instead.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../context/AppContext';

const GeolocationBanner = () => {
    const { fetchEvents, setLocationInput } = useAppStore();
    const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'dismissed'

    // Don't show if geolocation isn't available
    if (!navigator.geolocation) return null;
    if (state === 'dismissed') return null;

    const handleAllow = () => {
        setState('loading');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lon } = position.coords;

                // Build a human-readable label from coordinates.
                // We use the coordinates directly as the search term — the backend
                // will geocode it and return the nearest named location.
                const coordString = `${lat.toFixed(4)},${lon.toFixed(4)}`;
                setLocationInput(coordString);
                await fetchEvents(coordString);
                setState('dismissed');
            },
            (error) => {
                console.warn('[Geolocation] Access denied or failed:', error.message);
                setState('dismissed');
            },
            { timeout: 8000 }
        );
    };

    return (
        <AnimatePresence>
            {state !== 'dismissed' && (
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
                >
                    <div className="glass-card px-5 py-4 flex items-center gap-4 border-indigo-400/30">
                        <span className="text-2xl flex-shrink-0" role="img" aria-label="telescope">🔭</span>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight">
                                See what&apos;s in your sky tonight
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Share your location for personalized sky events.
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handleAllow}
                                disabled={state === 'loading'}
                                className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                                {state === 'loading' ? 'Locating…' : 'Allow'}
                            </button>
                            <button
                                onClick={() => setState('dismissed')}
                                className="text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded-lg transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GeolocationBanner;
