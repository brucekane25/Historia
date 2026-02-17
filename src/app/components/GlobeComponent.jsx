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

// ===== Globe with Earth Texture =====
function Globe({ isDark }) {
    const meshRef = useRef();
    const cloudsRef = useRef();

    const dayTexture = useLoader(THREE.TextureLoader, "/textures/earth-day.jpg");
    const nightTexture = useLoader(THREE.TextureLoader, "/textures/earth-night.jpg");
    const bumpTexture = useLoader(THREE.TextureLoader, "/textures/earth-bump.png");

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.02;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.025;
        }
    });

    const atmosphereColor = isDark ? "#6366f1" : "#818cf8";

    return (
        <group>
            {/* Main earth globe */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={isDark ? nightTexture : dayTexture}
                    bumpMap={bumpTexture}
                    bumpScale={0.04}
                    metalness={isDark ? 0.1 : 0.05}
                    roughness={isDark ? 0.9 : 0.75}
                />
            </mesh>

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

            {/* Outer glow */}
            <mesh>
                <sphereGeometry args={[1.12, 64, 64]} />
                <meshBasicMaterial
                    color={atmosphereColor}
                    transparent
                    opacity={0.025}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

// ===== Spatial Clustering =====
function clusterEvents(events, gridSize = 12) {
    const clusters = {};
    events.forEach((event) => {
        const latBin = Math.floor(event.coordinates.lat / gridSize) * gridSize;
        const lonBin = Math.floor(event.coordinates.lon / gridSize) * gridSize;
        const key = `${latBin}_${lonBin}`;
        if (!clusters[key]) {
            clusters[key] = {
                lat: latBin + gridSize / 2,
                lon: lonBin + gridSize / 2,
                events: [],
                categories: {},
            };
        }
        clusters[key].events.push(event);
        const cat = event.category || "Default";
        clusters[key].categories[cat] = (clusters[key].categories[cat] || 0) + 1;
    });
    return Object.values(clusters);
}

// ===== 3D Cluster Bar =====
function ClusterBar({ cluster, maxCount, onBarClick }) {
    const barRef = useRef();
    const [hovered, setHovered] = useState(false);

    const position = useMemo(
        () => latLonToVector3(cluster.lat, cluster.lon, 1.01),
        [cluster.lat, cluster.lon]
    );

    // Bar height: log scale, min 0.03, max 0.25
    const height = useMemo(() => {
        const normalized = Math.log(cluster.events.length + 1) / Math.log(maxCount + 1);
        return 0.03 + normalized * 0.22;
    }, [cluster.events.length, maxCount]);

    // Dominant category color
    const color = useMemo(() => {
        const dominant = Object.entries(cluster.categories).sort(
            (a, b) => b[1] - a[1]
        )[0];
        return getCategoryColor(dominant[0]);
    }, [cluster.categories]);

    // Orient bar to point outward from globe center
    const lookAt = useMemo(() => {
        const dir = position.clone().normalize();
        return new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir
        );
    }, [position]);

    useFrame((_, delta) => {
        if (barRef.current) {
            const targetScale = hovered ? 1.3 : 1;
            barRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                delta * 8
            );
        }
    });

    return (
        <group position={position} quaternion={lookAt}>
            {/* Bar cylinder */}
            <mesh
                ref={barRef}
                position={[0, height / 2, 0]}
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
                    onBarClick(cluster);
                }}
            >
                <cylinderGeometry args={[0.012, 0.018, height, 8]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={hovered ? 0.95 : 0.8}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.4 : 0.15}
                />
            </mesh>

            {/* Top cap glow */}
            <mesh position={[0, height, 0]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>

            {/* Hover tooltip */}
            {hovered && (
                <Html
                    position={[0, height + 0.06, 0]}
                    center
                    distanceFactor={3}
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        className="px-3 py-2 rounded-lg shadow-xl text-center"
                        style={{
                            background: "rgba(15,17,30,0.92)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            minWidth: "120px",
                        }}
                    >
                        <p className="text-sm font-bold text-white">
                            {cluster.events.length}
                        </p>
                        <p className="text-[10px] text-white/50">events</p>
                        <div className="flex flex-wrap gap-1 mt-1.5 justify-center">
                            {Object.entries(cluster.categories)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([cat, count]) => (
                                    <span
                                        key={cat}
                                        className="text-[9px] px-1.5 py-0.5 rounded-full text-white/80"
                                        style={{ backgroundColor: getCategoryColor(cat) + "40" }}
                                    >
                                        {cat} ({count})
                                    </span>
                                ))}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// ===== Cluster Bars Group =====
function ClusterBars({ events, onBarClick }) {
    const clusters = useMemo(() => clusterEvents(events, 15), [events]);
    const maxCount = useMemo(
        () => Math.max(...clusters.map((c) => c.events.length), 1),
        [clusters]
    );

    return (
        <group>
            {clusters
                .filter((c) => c.events.length >= 2)
                .map((cluster, i) => (
                    <ClusterBar
                        key={`${cluster.lat}_${cluster.lon}`}
                        cluster={cluster}
                        maxCount={maxCount}
                        onBarClick={onBarClick}
                    />
                ))}
        </group>
    );
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

// ===== Event Detail Card =====
function EventDetail({ event, isDark, onClose }) {
    if (!event) return null;

    const position = latLonToVector3(
        event.coordinates.lat,
        event.coordinates.lon,
        1.2
    );

    return (
        <Html position={position} center distanceFactor={3.5}>
            <div
                className="rounded-xl shadow-2xl overflow-hidden animate-fade-in-up"
                style={{
                    background: isDark
                        ? "rgba(15,17,30,0.95)"
                        : "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
                        }`,
                    minWidth: "280px",
                    maxWidth: "340px",
                }}
            >
                <div className="flex gap-3 p-4">
                    {event.thumbnail && (
                        <img
                            src={event.thumbnail}
                            alt={event.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                    )}
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                        <div>
                            <h3
                                className={`text-sm font-semibold leading-tight line-clamp-3 ${isDark ? "text-white" : "text-gray-900"
                                    }`}
                            >
                                {event.title}
                            </h3>
                            <a
                                href={`https://en.wikipedia.org/?curid=${event.pageID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 text-xs mt-1 inline-block"
                            >
                                Read on Wikipedia →
                            </a>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span
                                className={`text-lg font-bold ${isDark ? "text-purple-400" : "text-purple-600"
                                    }`}
                            >
                                {event.year}
                            </span>
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                                style={{
                                    backgroundColor: getCategoryColor(event.category),
                                }}
                            >
                                {event.category}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-black/10 text-black hover:bg-black/20"
                        } transition-colors`}
                >
                    ✕
                </button>
            </div>
        </Html>
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
            className={`absolute top-4 right-4 z-10 p-3 rounded-xl ${isDark ? "glass-dark" : "glass"
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

// ===== Main Globe Component =====
const GlobeComponent = ({ events, selectedEvent, mode, onEventSelect }) => {
    const isDark = !mode;
    const [localSelected, setLocalSelected] = useState(null);
    const [showBars, setShowBars] = useState(true);

    const activeEvent = selectedEvent || localSelected;

    const handlePinClick = useCallback(
        (event) => {
            setLocalSelected(event);
            if (onEventSelect) onEventSelect(event);
        },
        [onEventSelect]
    );

    const handleBarClick = useCallback(
        (cluster) => {
            // Select the first event in the cluster as a representative
            if (cluster.events.length === 1) {
                handlePinClick(cluster.events[0]);
            } else {
                // Could zoom in; for now select the most notable event
                const representative = cluster.events[0];
                handlePinClick(representative);
            }
        },
        [handlePinClick]
    );

    const handleClose = useCallback(() => {
        setLocalSelected(null);
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

                {/* Globe with texture */}
                <Globe isDark={isDark} />

                {/* 3D Bar Clusters */}
                {showBars && (
                    <ClusterBars events={events} onBarClick={handleBarClick} />
                )}

                {/* Individual Event Pins */}
                {!showBars && (
                    <EventPins
                        events={events}
                        onPinClick={handlePinClick}
                        selectedEvent={activeEvent}
                    />
                )}

                {/* Selected Event Detail */}
                {activeEvent && (
                    <EventDetail
                        event={activeEvent}
                        isDark={isDark}
                        onClose={handleClose}
                    />
                )}

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={1.5}
                    maxDistance={5}
                    rotateSpeed={0.5}
                    zoomSpeed={0.8}
                    autoRotate={!activeEvent}
                    autoRotateSpeed={0.3}
                />
            </Canvas>

            {/* Category Legend */}
            <CategoryLegend isDark={isDark} />

            {/* View toggle: Bars vs Pins */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => setShowBars(!showBars)}
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
                    {showBars ? "📍 Show Pins" : "📊 Show Clusters"}
                </button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <p
                    className={`text-xs px-4 py-2 rounded-full ${isDark ? "glass-dark text-white/40" : "glass text-black/40"
                        }`}
                >
                    Drag to rotate · Scroll to zoom · Click{" "}
                    {showBars ? "bars" : "pins"} to explore
                </p>
            </div>
        </div>
    );
};

export default GlobeComponent;
