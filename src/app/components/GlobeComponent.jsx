"use client";
import React, { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";

// ===== Utilities =====
function latLonToVector3(lat, lon, radius = 1.01) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
}

const categoryColors = {
    war: "#ef4444",
    political: "#8b5cf6",
    cultural: "#f59e0b",
    scientific: "#10b981",
    religious: "#eab308",
    disasters: "#f97316",
    discoveries: "#3b82f6",
    historical: "#ec4899",
    economic: "#14b8a6",
    social: "#f43f5e",
    births: "#a78bfa",
    deaths: "#6b7280",
    events: "#22d3ee",
    environmental: "#22c55e",
    selected: "#ffffff",
    Default: "#6b7280",
};

function getCategoryColor(category) {
    return categoryColors[category?.toLowerCase()] || categoryColors.Default;
}

// ===== World Borders (GeoJSON) =====
function WorldBorders({ isDark }) {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson")
            .then((res) => res.json())
            .then((data) => {
                const newLines = [];
                const radius = 1.002; // Slightly above globe surface

                data.features.forEach((feature) => {
                    const geometry = feature.geometry;

                    const processPolygon = (coords) => {
                        const points = [];
                        coords.forEach(([lon, lat]) => {
                            points.push(latLonToVector3(lat, lon, radius));
                        });
                        // Close the loop
                        points.push(points[0]);
                        newLines.push(points);
                    };

                    if (geometry.type === "Polygon") {
                        geometry.coordinates.forEach((ring) => processPolygon(ring));
                    } else if (geometry.type === "MultiPolygon") {
                        geometry.coordinates.forEach((polygon) => {
                            polygon.forEach((ring) => processPolygon(ring));
                        });
                    }
                });
                setLines(newLines);
            })
            .catch((err) => console.error("Failed to load borders:", err));
    }, []);

    const material = useMemo(
        () =>
            new THREE.LineBasicMaterial({
                color: isDark ? "#4b5563" : "#9ca3af",
                transparent: true,
                opacity: isDark ? 0.3 : 0.4,
            }),
        [isDark]
    );

    return (
        <group>
            {lines.map((points, i) => {
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                return <line key={i} geometry={geometry} material={material} />;
            })}
        </group>
    );
}

// ===== Globe with Earth Texture =====
function Globe({ isDark }) {
    const cloudsRef = useRef();

    const dayTexture = useLoader(THREE.TextureLoader, "/textures/earth-day.jpg");
    const nightTexture = useLoader(THREE.TextureLoader, "/textures/earth-night.jpg");
    const bumpTexture = useLoader(THREE.TextureLoader, "/textures/earth-bump.png");

    useFrame((_, delta) => {
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.005; // Independent slow cloud rotation
        }
    });

    const atmosphereColor = isDark ? "#6366f1" : "#818cf8";

    return (
        <group>
            {/* Main earth globe */}
            <mesh>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={isDark ? nightTexture : dayTexture}
                    bumpMap={bumpTexture}
                    bumpScale={0.04}
                    metalness={isDark ? 0.1 : 0.05}
                    roughness={isDark ? 0.9 : 0.75}
                />
            </mesh>

            {/* Country Borders */}
            <WorldBorders isDark={isDark} />

            {/* Cloud layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[1.005, 48, 48]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={isDark ? 0.03 : 0.08}
                    wireframe
                />
            </mesh>

            {/* Atmosphere glow */}
            <mesh>
                <sphereGeometry args={[1.06, 64, 64]} />
                <meshBasicMaterial
                    color={atmosphereColor}
                    transparent
                    opacity={isDark ? 0.08 : 0.04}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

// ===== Heatmap Mesh (Peaks & Valleys) =====
function HeatmapMesh({ events, maxPeakHeight = 0.3 }) { // maxPeakHeight scaled down for better visual

    // Generate heatmap data once when events change
    const { geometry } = useMemo(() => {
        const width = 180; // Reduced Grid resolution W
        const height = 90; // Reduced Grid resolution H
        const grid = new Float32Array(width * height).fill(0);

        // Populate grid
        events.forEach(e => {
            const x = Math.floor((e.coordinates.lon + 180) / 360 * width) % width;
            const y = Math.floor((e.coordinates.lat + 90) / 180 * height);
            const idx = y * width + x;
            if (idx >= 0 && idx < grid.length) grid[idx] += 1;
        });

        // Properties for smoothing
        const smoothedGrid = new Float32Array(width * height).fill(0);
        const kernel = [
            [0.05, 0.1, 0.05],
            [0.1, 0.4, 0.1],
            [0.05, 0.1, 0.05]
        ];

        // Blur
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        sum += grid[(y + ky) * width + (x + kx)] * kernel[ky + 1][kx + 1];
                    }
                }
                smoothedGrid[y * width + x] = sum;
            }
        }

        let maxVal = 0;
        for (let i = 0; i < smoothedGrid.length; i++) maxVal = Math.max(maxVal, smoothedGrid[i]);

        // Geometry generation - Reduced segments for performance
        const segW = 72;
        const segH = 72;
        const geo = new THREE.SphereGeometry(1.01, segW, segH);
        const posAttribute = geo.attributes.position;
        const colorAttribute = new Float32Array(posAttribute.count * 3);
        const vertexPos = new THREE.Vector3();

        // Colors
        const colorLow = new THREE.Color("#3b82f6");
        const colorMid = new THREE.Color("#10b981");
        const colorHigh = new THREE.Color("#ef4444");

        for (let i = 0; i < posAttribute.count; i++) {
            vertexPos.set(posAttribute.getX(i), posAttribute.getY(i), posAttribute.getZ(i));

            const normalized = vertexPos.clone().normalize();
            const u = 0.5 + Math.atan2(normalized.z, normalized.x) / (2 * Math.PI);
            const v = 0.5 - Math.asin(normalized.y) / Math.PI;

            // Sample grid
            const gx = Math.floor(u * width) % width;
            const gy = Math.floor(v * height);
            const idx = gy * width + gx;
            const val = smoothedGrid[idx] || 0;
            const intensity = maxVal > 0 ? Math.min(val / (maxVal * 0.6), 1) : 0;

            // Displace
            if (intensity > 0.05) {
                const displacement = intensity * maxPeakHeight;
                const newPos = vertexPos.add(normalized.multiplyScalar(displacement));
                posAttribute.setXYZ(i, newPos.x, newPos.y, newPos.z);
            }

            // Color
            const color = new THREE.Color();
            if (intensity < 0.05) {
                color.setHex(0x000000);
            } else if (intensity < 0.5) {
                color.lerpColors(colorLow, colorMid, intensity * 2);
            } else {
                color.lerpColors(colorMid, colorHigh, (intensity - 0.5) * 2);
            }

            colorAttribute[i * 3] = color.r;
            colorAttribute[i * 3 + 1] = color.g;
            colorAttribute[i * 3 + 2] = color.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colorAttribute, 3));
        return { geometry: geo };

    }, [events, maxPeakHeight]);

    // Custom shader material for transparency modulation
    const material = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, []);

    // Cleanup memory
    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);

    return <mesh geometry={geometry} material={material} />;
}


// ===== Individual Event Pin =====
function EventPin({ event, onPinClick, isSelected }) {
    const pinRef = useRef();
    const glowRef = useRef();
    const [hovered, setHovered] = useState(false);

    const position = useMemo(
        () => latLonToVector3(event.coordinates.lat, event.coordinates.lon, 1.01),
        [event.coordinates.lat, event.coordinates.lon]
    );

    const color = useMemo(
        () => getCategoryColor(event.category),
        [event.category]
    );

    useFrame((_, delta) => {
        if (pinRef.current) {
            const targetScale = hovered || isSelected ? 2.2 : 1;
            pinRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                delta * 8
            );
        }
        if (glowRef.current) {
            glowRef.current.material.opacity =
                0.3 + Math.sin(Date.now() * 0.003) * 0.15;
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={pinRef}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = "auto";
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onPinClick(event);
                }}
            >
                <sphereGeometry args={[0.008, 10, 10]} />
                <meshBasicMaterial color={color} />
            </mesh>

            <mesh ref={glowRef}>
                <sphereGeometry args={[0.015, 10, 10]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>

            {hovered && (
                <Html
                    position={[0, 0.035, 0]}
                    center
                    distanceFactor={4}
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        className="px-3 py-2 rounded-lg shadow-xl max-w-[220px] whitespace-nowrap"
                        style={{
                            background: "rgba(15,17,30,0.92)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <p className="text-xs font-medium text-white truncate">
                            {event.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-purple-300">{event.year}</span>
                            <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full text-white/70"
                                style={{
                                    backgroundColor: getCategoryColor(event.category) + "30",
                                }}
                            >
                                {event.category}
                            </span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// ===== Event Pins Group =====
function EventPins({ events, onPinClick, selectedEvent }) {
    const visibleEvents = useMemo(() => events.slice(0, 1200), [events]);

    return (
        <group>
            {visibleEvents.map((event) => (
                <EventPin
                    key={event._id}
                    event={event}
                    onPinClick={onPinClick}
                    isSelected={selectedEvent?._id === event._id}
                />
            ))}
        </group>
    );
}



// ===== Category Legend =====
function CategoryLegend({ isDark }) {
    const topCategories = [
        "war",
        "political",
        "scientific",
        "cultural",
        "historical",
        "discoveries",
        "births",
        "deaths",
    ];

    return (
        <div
            className={`absolute top-4 right-4 z-[1010] p-3 rounded-xl ${isDark ? "glass-dark" : "glass"
                }`}
            style={{
                border: isDark
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(0,0,0,0.06)",
            }}
        >
            <p
                className={`text-[10px] font-medium mb-2 ${isDark ? "text-white/40" : "text-gray-400"
                    }`}
            >
                CATEGORIES
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {topCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-1.5">
                        <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCategoryColor(cat) }}
                        />
                        <span
                            className={`text-[10px] capitalize ${isDark ? "text-white/50" : "text-gray-500"
                                }`}
                        >
                            {cat}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ===== Common Rotation Group =====
function RotatingGlobeGroup({ children }) {
    const groupRef = useRef();

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.02;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

// Helper for pausing rotation
function RotatingGlobeGroupWithPause({ children, paused }) {
    const groupRef = useRef();
    useFrame((_, delta) => {
        if (groupRef.current && !paused) {
            groupRef.current.rotation.y += delta * 0.02;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

// ===== Main Globe Component =====
const GlobeComponent = ({ events, selectedEvent, lightMode, onEventSelect }) => {
    const isDark = !lightMode;
    const [showHeatmap, setShowHeatmap] = useState(false); // Default: Pins (false)

    const activeEvent = selectedEvent;

    const handlePinClick = useCallback(
        (event) => {
            if (onEventSelect) onEventSelect(event);
        },
        [onEventSelect]
    );

    const handleClose = useCallback(() => {
        if (onEventSelect) onEventSelect(null);
    }, [onEventSelect]);

    return (
        <div
            className="relative h-full w-full"
            style={{ background: isDark ? "#0a0c1a" : "#e8ecf4" }}
        >
            <Canvas
                camera={{ position: [0, 0, 2.6], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                {/* Lighting */}
                <ambientLight intensity={isDark ? 0.4 : 0.6} />
                <directionalLight
                    position={[5, 3, 5]}
                    intensity={isDark ? 1.0 : 1.2}
                />
                <pointLight
                    position={[-5, -3, -5]}
                    intensity={0.3}
                    color="#6366f1"
                />

                {/* Stars (dark mode) */}
                {isDark && (
                    <Stars
                        radius={100}
                        depth={50}
                        count={3000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={0.5}
                    />
                )}

                {/* ROTATING GROUP */}
                <RotatingGlobeGroupWithPause paused={!!activeEvent}>
                    <Globe isDark={isDark} />

                    {/* Render Heatmap OR Pins */}
                    {showHeatmap && (
                        <HeatmapMesh events={events} />
                    )}

                    {!showHeatmap && (
                        <EventPins
                            events={events}
                            onPinClick={handlePinClick}
                            selectedEvent={activeEvent}
                        />
                    )}


                </RotatingGlobeGroupWithPause>


                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={1.5}
                    maxDistance={5}
                    rotateSpeed={0.5}
                    zoomSpeed={0.8}
                    autoRotate={false}
                />
            </Canvas>

            {/* Category Legend */}
            <CategoryLegend isDark={isDark} />

            {/* View toggle: Heatmap vs Pins */}
            <div className="absolute top-4 left-4 z-[1010]">
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark
                        ? "glass-dark text-white/70 hover:text-white"
                        : "glass text-gray-600 hover:text-gray-900"
                        }`}
                    style={{
                        border: isDark
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    {showHeatmap ? "📍 Show Pins" : "🌋 Show Density Peaks"}
                </button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <p
                    className={`text-xs px-4 py-2 rounded-full ${isDark ? "glass-dark text-white/40" : "glass text-black/40"
                        }`}
                >
                    Drag to rotate · Scroll to zoom · {showHeatmap ? "Explore density peaks" : "Click pins to explore"}
                </p>
            </div>
        </div>
    );
};

export default GlobeComponent;
