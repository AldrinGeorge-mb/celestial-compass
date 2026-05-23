// frontend/src/App.jsx
// Root application component. Manages layout and orchestrates data fetching.
// All state lives in the Zustand store (AppContext) — this component is
// intentionally lean: layout + effects only.

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import useAppStore from './context/AppContext';

import CosmicFeature    from './components/CosmicFeature';
import ISSTracker       from './components/ISSTracker';
import EventsDisplay    from './components/EventsDisplay';
import EventModal       from './components/EventModal';
import SkeletonLoader   from './components/SkeletonLoader';
import GeolocationBanner from './components/GeolocationBanner';

function App() {
    const {
        locationInput,
        searchedLocation,
        events,
        apodData,
        selectedEvent,
        isLoadingEvents,
        isLoadingApod,
        eventsError,
        apodError,
        degradedMode,
        degradedMessage,
        setLocationInput,
        setSelectedEvent,
        fetchEvents,
        fetchApod,
    } = useAppStore();

    // ── Initial data fetch on mount ───────────────────────────────────────────
    useEffect(() => {
        fetchApod();
        fetchEvents(locationInput);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents(locationInput);
    };

    return (
        <div className="min-h-screen antialiased">
            {/* Geolocation onboarding banner */}
            <GeolocationBanner />

            {/* Event detail modal — rendered at root level to escape any stacking context */}
            <AnimatePresence>
                {selectedEvent && (
                    <EventModal
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}
            </AnimatePresence>

            <div className="container mx-auto p-4 md:p-8 max-w-7xl">

                {/* ── Header ──────────────────────────────────────────────── */}
                <motion.header
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Celestial Compass
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-300/80 mt-3">
                        Your personal guide to the cosmos
                    </p>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left Column ─────────────────────────────────────── */}
                    <motion.div
                        className="lg:col-span-1 space-y-8"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {/* Location Search */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4 text-center">Find Your Sky</h2>
                            <form onSubmit={handleSearch} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    id="location-input"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    placeholder="City, country, or region..."
                                    className="w-full bg-gray-900/50 border border-indigo-400/40 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoadingEvents}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30"
                                >
                                    {isLoadingEvents ? 'Searching…' : 'Search'}
                                </button>
                            </form>
                        </div>

                        {/* Cosmic Feature (Globe + APOD) */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Today&apos;s Cosmic Feature</h2>
                            {isLoadingApod && <SkeletonLoader variant="apod" />}
                            {apodError && (
                                <p className="text-red-400 text-sm">{apodError}</p>
                            )}
                            {apodData && !isLoadingApod && (
                                <CosmicFeature
                                    apod={apodData}
                                    location={searchedLocation}
                                />
                            )}
                        </div>

                        {/* ISS Live Tracker */}
                        <ISSTracker />
                    </motion.div>

                    {/* ── Right Column ────────────────────────────────────── */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Degraded mode banner */}
                        <AnimatePresence>
                            {degradedMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-300 text-sm"
                                >
                                    ⚠️ {degradedMessage || 'Showing sample data — live API is temporarily unavailable.'}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {searchedLocation && (
                            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                                Sky Events for{' '}
                                <span className="text-indigo-300">{searchedLocation.name}</span>
                            </h3>
                        )}

                        {isLoadingEvents && <SkeletonLoader variant="events" />}
                        {eventsError && !isLoadingEvents && (
                            <div className="glass-card p-8 text-center">
                                <p className="text-red-400 text-lg">{eventsError}</p>
                                <button
                                    onClick={() => fetchEvents(locationInput)}
                                    className="mt-4 text-indigo-400 hover:text-indigo-200 transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        )}
                        {!isLoadingEvents && !eventsError && (
                            <EventsDisplay
                                events={events}
                                onEventClick={setSelectedEvent}
                            />
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default App;
