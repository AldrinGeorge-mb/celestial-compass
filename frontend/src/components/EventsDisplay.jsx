// frontend/src/components/EventsDisplay.jsx
// Renders the filterable sky events grid with:
//   - Category filter tabs (all / launch / flyover / meteor / celestial)
//   - Framer Motion stagger animations on content change
//   - Visibility score badge per event (from Phase 3 backend data)
//   - Type-specific layouts (table for flyovers, cards for others)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

// ── Visibility Badge ───────────────────────────────────────────────────────────
const VisibilityBadge = ({ score, isMock }) => {
    if (score === undefined || score === null) return null;

    const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Moderate' : 'Poor';
    const color = score >= 75
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
        : score >= 50
        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
        : 'bg-red-500/20 text-red-300 border-red-400/30';

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}
            title={isMock ? 'Estimated visibility (no weather API key)' : 'Live cloud cover data'}
        >
            <span>{score}%</span>
            <span>{label}</span>
            {isMock && <span className="opacity-50">~</span>}
        </span>
    );
};

// ── Animation Variants ─────────────────────────────────────────────────────────
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
    exit:   { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const cardVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ── Filter Tabs ────────────────────────────────────────────────────────────────
const FILTERS = ['all', 'launch', 'flyover', 'meteor', 'celestial'];

// ── Sub-layouts per event type ─────────────────────────────────────────────────

const DefaultCard = ({ event, onEventClick }) => (
    <motion.div
        key={event.date + event.title}
        variants={cardVariants}
        className="glass-card p-5 flex flex-col h-full"
    >
        <div className="flex items-center mb-3 gap-3">
            <div className="text-indigo-400 flex-shrink-0">
                <Icon type={event.type} />
            </div>
            <h4 className="text-base font-bold flex-grow leading-snug">{event.title}</h4>
        </div>
        <p className="text-xs text-indigo-300 mb-1">
            {new Date(event.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <div className="mb-3">
            <VisibilityBadge score={event.visibilityScore} isMock={event.isMock} />
        </div>
        <p className="text-gray-300 text-sm flex-grow mb-4 leading-relaxed">{event.description}</p>
        <button
            onClick={() => onEventClick(event)}
            className="mt-auto text-sm bg-gray-700/50 hover:bg-indigo-600/80 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
            See Details
        </button>
    </motion.div>
);

const LaunchCard = ({ event, onEventClick }) => (
    <motion.div key={event.title} variants={cardVariants} className="glass-card p-5 flex items-start gap-4">
        <img className="w-16 h-16 rounded-md bg-black/30 flex-shrink-0 object-cover" src={event.missionPatch} alt="Mission Patch" />
        <div className="flex-grow min-w-0">
            <p className="text-xs text-indigo-300 mb-1">
                {new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
            <h4 className="text-xl font-bold">{event.title}</h4>
            <div className="my-2">
                <VisibilityBadge score={event.visibilityScore} isMock={event.isMock} />
            </div>
            <p className="mt-1 text-gray-300 text-sm">{event.description}</p>
            <button onClick={() => onEventClick(event)} className="mt-4 text-sm bg-gray-700/50 hover:bg-indigo-600/80 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                Mission Details
            </button>
        </div>
    </motion.div>
);

const MeteorCard = ({ event, onEventClick }) => (
    <motion.div key={event.title} variants={cardVariants} className="glass-card p-5">
        <h3 className="text-xl font-bold mb-1">{event.title}</h3>
        <p className="text-indigo-300 text-sm mb-2">
            Peak Night: {new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>
        <div className="mb-3">
            <VisibilityBadge score={event.visibilityScore} isMock={event.isMock} />
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
        <button onClick={() => onEventClick(event)} className="mt-4 text-sm bg-gray-700/50 hover:bg-indigo-600/80 text-white font-semibold py-2 px-4 rounded-lg transition-all">
            View Gallery
        </button>
    </motion.div>
);

const CelestialCard = ({ event, onEventClick }) => (
    <motion.div key={event.title} variants={cardVariants} className="glass-card p-5">
        <div className="flex items-center gap-3 mb-3">
            <Icon type="celestial" />
            <div>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-indigo-300 text-xs">
                    {new Date(event.date).toLocaleString('en-IN', { dateStyle: 'medium' })}
                </p>
            </div>
        </div>
        <div className="mb-3">
            <VisibilityBadge score={event.visibilityScore} isMock={event.isMock} />
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
        <button onClick={() => onEventClick(event)} className="mt-4 text-sm bg-gray-700/50 hover:bg-indigo-600/80 text-white font-semibold py-2 px-4 rounded-lg transition-all">
            Learn More
        </button>
    </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const EventsDisplay = ({ events, onEventClick }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filtered = activeFilter === 'all'
        ? events
        : events.filter((e) => e.type === activeFilter);

    const renderContent = () => {
        if (filtered.length === 0) {
            return (
                <motion.div variants={cardVariants} className="glass-card p-10 text-center">
                    <p className="text-xl text-gray-400">No events found for this category.</p>
                </motion.div>
            );
        }

        switch (activeFilter) {
            case 'launch':
                return filtered.map((e) => <LaunchCard key={e.title} event={e} onEventClick={onEventClick} />);
            case 'flyover':
                return (
                    <motion.div variants={cardVariants} className="glass-card overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-indigo-300 text-xs uppercase">
                                <tr>
                                    <th className="p-3">Satellite</th>
                                    <th className="p-3">Time</th>
                                    <th className="p-3">Duration</th>
                                    <th className="p-3">Visibility</th>
                                    <th className="p-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((e) => (
                                    <tr key={e.date + e.title} className="border-t border-gray-700/40 hover:bg-gray-800/40 transition-colors">
                                        <td className="p-3 font-semibold">{e.title}</td>
                                        <td className="p-3 text-indigo-300">{new Date(e.date).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</td>
                                        <td className="p-3">{e.duration} min</td>
                                        <td className="p-3"><VisibilityBadge score={e.visibilityScore} isMock={e.isMock} /></td>
                                        <td className="p-3">
                                            <button onClick={() => onEventClick(e)} className="text-indigo-400 hover:text-indigo-200 transition-colors">
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                );
            case 'meteor':
                return filtered.map((e) => <MeteorCard key={e.title} event={e} onEventClick={onEventClick} />);
            case 'celestial':
                return filtered.map((e) => <CelestialCard key={e.title} event={e} onEventClick={onEventClick} />);
            default: // 'all'
                return filtered.map((e) => <DefaultCard key={e.date + e.title} event={e} onEventClick={onEventClick} />);
        }
    };

    return (
        <div>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`filter-btn capitalize ${activeFilter === f ? 'active' : ''}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Animated Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeFilter}
                    className={activeFilter === 'all' || activeFilter === 'flyover'
                        ? 'space-y-0'
                        : 'grid grid-cols-1 gap-6'}
                    style={activeFilter === 'all' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' } : {}}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default EventsDisplay;