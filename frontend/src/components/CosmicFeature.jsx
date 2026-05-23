// frontend/src/components/CosmicFeature.jsx
// Renders:
//   1. An interactive 3D Earth globe (Three.js + OrbitControls)
//   2. NASA's Astronomy Picture of the Day image/video + caption
//
// Performance fixes applied:
//   - WebGL scene is created ONCE (empty [] dep array).
//   - When `location` changes, a second useEffect smoothly rotates the
//     camera to face the new coordinates — no scene teardown or rebuild.
//   - Globe texture is loaded via the backend proxy (/api/globe-image)
//     for CORS safety and browser-level caching.

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Converts geographic coordinates to a unit-sphere 3D vector.
 * @param {number} lat  Latitude  (-90 to 90)
 * @param {number} lon  Longitude (-180 to 180)
 * @returns {THREE.Vector3}
 */
function latLonToVector3(lat, lon) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
         Math.cos(phi),
         Math.sin(phi) * Math.sin(theta)
    );
}

// ── Component ──────────────────────────────────────────────────────────────────

const CosmicFeature = ({ apod, location }) => {
    const containerRef = useRef(null);

    // Persistent refs — survive re-renders without rebuilding the scene
    const rendererRef  = useRef(null);
    const earthRef     = useRef(null);
    const controlsRef  = useRef(null);
    const cameraRef    = useRef(null);
    const frameIdRef   = useRef(null);

    // Camera orbit target — updated when location changes
    const cameraTargetRef = useRef(new THREE.Spherical(3, Math.PI / 2, 0));

    // ── Scene Initialization (runs exactly once) ─────────────────────────────
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene & Camera
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            2000
        );
        camera.position.setFromSpherical(cameraTargetRef.current);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const sun = new THREE.DirectionalLight(0xffd5a0, 1.4);
        sun.position.set(5, 3, 5);
        scene.add(sun);
        scene.add(new THREE.HemisphereLight(0x8888ff, 0x222266, 0.4));

        // Earth — texture loaded via backend proxy for CORS safety
        const loader      = new THREE.TextureLoader();
        const earthGeo    = new THREE.SphereGeometry(1, 64, 64);
        const earthMat    = new THREE.MeshPhongMaterial({ shininess: 15 });
        const earth       = new THREE.Mesh(earthGeo, earthMat);
        scene.add(earth);
        earthRef.current  = earth;

        loader.load(
            '/api/globe-image', // ← Backend proxy (was: external solarsystemscope URL)
            (texture) => { earthMat.map = texture; earthMat.needsUpdate = true; },
            undefined,
            (err) => {
                // Fallback: simple blue sphere if texture fails
                console.warn('[CosmicFeature] Globe texture failed to load:', err);
                earthMat.color.set(0x1a4a8a);
            }
        );

        // Atmosphere glow
        const atmosGeo = new THREE.SphereGeometry(1.02, 64, 64);
        const atmosMat = new THREE.MeshPhongMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.08,
            side: THREE.FrontSide,
        });
        scene.add(new THREE.Mesh(atmosGeo, atmosMat));

        // Starfield
        const starGeo  = new THREE.BufferGeometry();
        const starVerts = [];
        for (let i = 0; i < 12000; i++) {
            starVerts.push(
                THREE.MathUtils.randFloatSpread(1800),
                THREE.MathUtils.randFloatSpread(1800),
                THREE.MathUtils.randFloatSpread(1800)
            );
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));

        // Orbit Controls
        const controls       = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed   = 0.5;
        controls.zoomSpeed     = 0.8;
        controls.minDistance   = 1.5;
        controls.maxDistance   = 8;
        controlsRef.current    = controls;

        // Animation loop — lerps camera toward cameraTargetRef if set
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);

            // Gentle auto-rotation when user is not interacting
            earth.rotation.y += 0.0008;

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const onResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', onResize);

        // Cleanup on component unmount
        return () => {
            cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            earthGeo.dispose();
            earthMat.dispose();
            starGeo.dispose();
            atmosGeo.dispose();
            atmosMat.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []); // ← Empty deps: runs ONCE. Scene is never rebuilt.

    // ── Camera Rotation on Location Change ───────────────────────────────────
    // Instead of rebuilding the scene, we simply reposition the camera to face
    // the searched coordinates. OrbitControls handles the smooth interpolation.
    useEffect(() => {
        if (!location?.lat || !location?.lon || !cameraRef.current || !controlsRef.current) return;

        const target3D = latLonToVector3(location.lat, location.lon).multiplyScalar(3);
        cameraRef.current.position.lerp(target3D, 0.6);
        cameraRef.current.lookAt(0, 0, 0);
        controlsRef.current.update();
    }, [location]); // ← Only camera moves — no scene rebuild.

    // ── APOD Media Renderer ───────────────────────────────────────────────────
    const renderMedia = () => {
        if (!apod) return null;
        if (apod.media_type === 'video') {
            return (
                <iframe
                    src={apod.url}
                    title="Astronomy Video of the Day"
                    allow="encrypted-media"
                    allowFullScreen
                    className="rounded-lg mb-4 w-full aspect-video border-0"
                />
            );
        }
        return (
            <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                className="rounded-lg mb-4 w-full aspect-video object-cover"
                loading="lazy"
            />
        );
    };

    return (
        <>
            {/* 3D Globe — responsive height via clamp */}
            <div
                ref={containerRef}
                className="w-full rounded-xl overflow-hidden bg-black cursor-grab active:cursor-grabbing"
                style={{ height: 'clamp(220px, 35vw, 420px)' }}
            />
            <p className="text-center mt-2 text-indigo-300/70 text-xs tracking-wide">
                Interactive Globe · Drag to rotate · Scroll to zoom
            </p>

            {/* APOD section */}
            {apod && (
                <div className="mt-5">
                    <h3 className="text-lg font-bold mb-3 leading-snug">
                        {apod.title}
                    </h3>
                    {renderMedia()}
                    <p className="text-gray-300/80 text-sm leading-relaxed max-h-28 overflow-y-auto scrollbar-thin">
                        {apod.explanation}
                    </p>
                </div>
            )}
        </>
    );
};

export default CosmicFeature;
