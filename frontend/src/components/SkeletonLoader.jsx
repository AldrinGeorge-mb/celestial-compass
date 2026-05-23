// frontend/src/components/SkeletonLoader.jsx
// Shimmer placeholder cards used during loading states.
// Two variants:
//   - "events"  → grid of event card skeletons
//   - "apod"    → vertical stack for the APOD panel

import React from 'react';
import { motion } from 'framer-motion';

const Shimmer = ({ className = '' }) => (
    <div className={`skeleton rounded-md ${className}`} />
);

const EventCardSkeleton = () => (
    <div className="glass-card p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
            <Shimmer className="w-6 h-6 rounded-full flex-shrink-0" />
            <Shimmer className="h-5 w-3/4" />
        </div>
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
        <Shimmer className="mt-2 h-9 w-28 rounded-lg" />
    </div>
);

const SkeletonLoader = ({ variant = 'events', count = 4 }) => {
    if (variant === 'apod') {
        return (
            <div className="flex flex-col gap-4">
                <Shimmer className="w-full aspect-video rounded-xl" />
                <Shimmer className="h-5 w-3/4" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-5/6" />
                <Shimmer className="h-4 w-4/6" />
            </div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.07 } },
            }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    variants={{
                        hidden:  { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                    }}
                >
                    <EventCardSkeleton />
                </motion.div>
            ))}
        </motion.div>
    );
};

export default SkeletonLoader;
