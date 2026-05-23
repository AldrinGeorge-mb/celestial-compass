// frontend/src/context/AppContext.jsx
// Global state management using Zustand.
// All components read from and write to this store — no prop drilling.

import { create } from 'zustand';

const API_BASE = '/api'; // Vite proxies /api/* → backend at localhost:5001

const useAppStore = create((set, get) => ({
    // ── UI State ────────────────────────────────────────────────────────────
    locationInput:    'New York',       // Controlled input string
    searchedLocation: null,             // { name, lat, lon } — set after geocoding
    selectedEvent:    null,             // Currently open event in modal
    degradedMode:     false,            // True when API is down, showing mock data
    degradedMessage:  '',

    // ── Data ────────────────────────────────────────────────────────────────
    events:   [],
    apodData: null,

    // ── Loading & Error ─────────────────────────────────────────────────────
    isLoadingEvents: false,
    isLoadingApod:   false,
    eventsError:     null,
    apodError:       null,

    // ── Actions ─────────────────────────────────────────────────────────────
    setLocationInput:  (val) => set({ locationInput: val }),
    setSelectedEvent:  (event) => set({ selectedEvent: event }),

    /** Fetches sky events for the given location string. */
    fetchEvents: async (locationQuery) => {
        if (!locationQuery?.trim()) return;

        set({ isLoadingEvents: true, eventsError: null });

        try {
            const res = await fetch(`${API_BASE}/events?location=${encodeURIComponent(locationQuery)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch events');
            }

            set({
                events:           data.events,
                // FIX: Use the geocoded coordinates from the backend, not hardcoded ones.
                searchedLocation: data.location,
                degradedMode:     data.degradedMode ?? false,
                degradedMessage:  data.message ?? '',
                isLoadingEvents:  false,
            });
        } catch (err) {
            console.error('[AppStore] fetchEvents error:', err.message);
            set({
                eventsError:     err.message,
                isLoadingEvents: false,
            });
        }
    },

    /** Fetches today's NASA Astronomy Picture of the Day. */
    fetchApod: async () => {
        set({ isLoadingApod: true, apodError: null });

        try {
            const res = await fetch(`${API_BASE}/apod`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch APOD');
            }

            set({ apodData: data, isLoadingApod: false });
        } catch (err) {
            console.error('[AppStore] fetchApod error:', err.message);
            set({ apodError: err.message, isLoadingApod: false });
        }
    },
}));

export default useAppStore;
