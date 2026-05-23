// frontend/src/components/EventModal.jsx
// Full-detail overlay modal for a selected sky event.
// Uses Framer Motion for smooth scale + fade entrance/exit.
// Must be wrapped in <AnimatePresence> by the parent (App.jsx).

import React from 'react';
import { motion } from 'framer-motion';

const EventModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
        // Backdrop
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            {/* Modal card — stopPropagation so clicking inside doesn't close */}
            <motion.div
                className="modal-content w-full max-w-xl"
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold leading-snug pr-4">{event.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-white transition-colors flex-shrink-0 leading-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Date */}
                <p className="text-indigo-300 text-sm mb-4">
                    {new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'long' })}
                </p>

                {/* Gallery */}
                {event.gallery?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                        {event.gallery.map((url) => (
                            <img
                                key={url}
                                src={url}
                                alt={event.title}
                                className="rounded-lg w-full h-32 object-cover"
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{event.description}</p>

                {/* Technical details (HTML from backend) */}
                <div
                    className="text-gray-300 text-sm space-y-2 border-t border-gray-700/50 pt-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: event.details }}
                />
            </motion.div>
        </motion.div>
    );
};

export default EventModal;