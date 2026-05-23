// backend/data/mockData.js
// Fallback data used when external APIs are unavailable or rate-limited.
// All shapes match the live API responses exactly.

const mockEvents = [
    {
        type: 'flyover',
        title: 'ISS Evening Pass (Sample)',
        date: '2025-10-05T19:02:00Z',
        description: 'A bright, steady light moving across the sky this evening.',
        brightness: -3.9,
        duration: 6,
        details: '<strong>Max Height:</strong> 75°<br><strong>Appears:</strong> 10° above WNW<br><strong>Disappears:</strong> 12° above SE',
        visibilityScore: 82,
        cloudCover: 15,
        isMock: true,
    },
    {
        type: 'launch',
        title: 'Starlink Group 9-1 (Sample)',
        date: '2025-10-08T19:30:00Z',
        description: 'A SpaceX Falcon 9 launching another batch of Starlink satellites.',
        missionPatch: 'https://placehold.co/100x100/000000/FFFFFF?text=SL',
        details: '<strong>Provider:</strong> SpaceX<br><strong>Vehicle:</strong> Falcon 9 Block 5',
        gallery: ['https://images.unsplash.com/photo-1634402735228-39e738472744?q=80&w=2070&auto=format&fit=crop'],
        visibilityScore: 60,
        cloudCover: 40,
        isMock: true,
    },
    {
        type: 'meteor',
        title: 'Orionids Meteor Shower (Sample)',
        date: '2025-10-21T22:00:00Z',
        description: 'Peak night for the Orionids, produced by debris from Comet Halley.',
        rate: '20/hr',
        details: '<strong>Peak Rate:</strong> ~20 meteors/hour<br><strong>Radiant:</strong> Constellation Orion',
        gallery: ['https://images.unsplash.com/photo-1534237939992-676a1d4d21e4?q=80&w=1974&auto=format&fit=crop'],
        visibilityScore: 74,
        cloudCover: 22,
        isMock: true,
    },
    {
        type: 'celestial',
        title: 'Total Lunar Eclipse (Sample)',
        date: '2025-09-07T18:30:00Z',
        description: 'A total lunar eclipse where the Moon passes through Earth\'s full shadow.',
        details: '<strong>Type:</strong> Total Lunar Eclipse<br>The moon rose while already in the Earth\'s shadow.',
        gallery: ['https://images.unsplash.com/photo-1598155519893-4f91136b856a?q=80&w=2070&auto=format&fit=crop'],
        visibilityScore: 91,
        cloudCover: 5,
        isMock: true,
    },
];

// Matches the NASA APOD API response shape (url, title, explanation, media_type)
const mockApod = {
    title: "Carina Nebula's Cosmic Cliffs",
    url: 'https://images.unsplash.com/photo-1657373539312-705c743a5713?q=80&w=2060&auto=format&fit=crop',
    hdurl: 'https://images.unsplash.com/photo-1657373539312-705c743a5713?q=80&w=2060&auto=format&fit=crop',
    media_type: 'image',
    explanation: 'This landscape of "mountains" and "valleys" speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula, captured by the James Webb Space Telescope.',
    date: new Date().toISOString().split('T')[0],
};

module.exports = { mockEvents, mockApod };