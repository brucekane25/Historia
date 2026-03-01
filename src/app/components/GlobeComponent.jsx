"use client";
import React, { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// ===== Atmosphere Shader =====
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 glowColor;
  uniform float intensity;
  
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
    fresnel = clamp(fresnel, 0.0, 1.0);
    vec3 color = glowColor * fresnel * intensity;
    gl_FragColor = vec4(color, fresnel * intensity * 0.8);
  }
`;

// ===== Globe Surface Shader for better lighting =====
const globeVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const globeFragmentShader = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D bumpTexture;
  uniform float isDark;
  uniform vec3 lightDirection;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    
    // Day/night mixing based on light direction
    float dayNight = dot(normal, lightDir);
    dayNight = smoothstep(-0.2, 0.3, dayNight);
    
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);
    
    // Apply bump mapping
    float bump = texture2D(bumpTexture, vUv).r;
    vec3 bumpNormal = normalize(normal + vec3(bump * 0.05));
    
    // Lighting
    float diffuse = max(dot(bumpNormal, lightDir), 0.0);
    float ambient = 0.15;
    
    vec3 finalDay = dayColor.rgb * (diffuse + ambient);
    vec3 finalNight = nightColor.rgb * 0.8;
    
    vec3 finalColor = mix(finalNight, finalDay, dayNight);
    
    // Add specular highlight
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(bumpNormal, halfDir), 0.0), 32.0);
    finalColor += vec3(spec * 0.2) * dayNight;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

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

// ===== Custom Atmosphere Component =====
function Atmosphere({ isDark }) {
    const meshRef = useRef();
    const glowColor = isDark ? new THREE.Color("#6366f1") : new THREE.Color("#818cf8");
    
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            uniforms: {
                glowColor: { value: glowColor },
                intensity: { value: isDark ? 1.5 : 1.0 }
            },
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, [isDark, glowColor]);
    
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0003;
        }
    });
    
    return (
        <mesh ref={meshRef} scale={[1.12, 1.12, 1.12]}>
            <sphereGeometry args={[1, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

// ===== Outer Glow Ring =====
function GlowRing({ isDark }) {
    const ringRef = useRef();
    const glowColor = isDark ? new THREE.Color("#8b5cf6") : new THREE.Color("#6366f1");
    
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform vec3 glowColor;
                uniform float time;
                
                void main() {
                    float dist = length(vPosition.xy);
                    float ring = smoothstep(0.95, 1.0, dist) * smoothstep(1.1, 1.0, dist);
                    float pulse = 0.8 + sin(time * 2.0) * 0.2;
                    gl_FragColor = vec4(glowColor, ring * pulse * 0.6);
                }
            `,
            uniforms: {
                glowColor: { value: glowColor },
                time: { value: 0 }
            },
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, [isDark, glowColor]);
    
    useFrame(({ clock }) => {
        if (ringRef.current) {
            ringRef.current.material.uniforms.time.value = clock.getElapsedTime();
            ringRef.current.rotation.z += 0.001;
        }
    });
    
    return (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.15, 1.35, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
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
    const globeRef = useRef();
    
    const dayTexture = useLoader(THREE.TextureLoader, "/textures/earth-day.jpg");
    const nightTexture = useLoader(THREE.TextureLoader, "/textures/earth-night.jpg");
    const bumpTexture = useLoader(THREE.TextureLoader, "/textures/earth-bump.png");
    
    dayTexture.wrapS = dayTexture.wrapT = THREE.RepeatWrapping;
    nightTexture.wrapS = nightTexture.wrapT = THREE.RepeatWrapping;
    
    const lightDirection = useMemo(() => new THREE.Vector3(5, 3, 5).normalize(), []);
    const atmosphereColor = isDark ? "#6366f1" : "#818cf8";
    
    const globeMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: globeVertexShader,
            fragmentShader: globeFragmentShader,
            uniforms: {
                dayTexture: { value: dayTexture },
                nightTexture: { value: nightTexture },
                bumpTexture: { value: bumpTexture },
                isDark: { value: isDark ? 1.0 : 0.0 },
                lightDirection: { value: lightDirection },
            },
        });
    }, [dayTexture, nightTexture, bumpTexture, isDark, lightDirection]);
    
    useFrame((_, delta) => {
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.008;
        }
        if (globeRef.current) {
            globeRef.current.rotation.y += delta * 0.001;
        }
    });
    
    return (
        <group>
            {/* Main earth globe */}
            <mesh ref={globeRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <primitive object={globeMaterial} attach="material" />
            </mesh>
            
            {/* Country Borders */}
            <WorldBorders isDark={isDark} />
            
            {/* Cloud layer with subtle animation */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[1.008, 48, 48]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={isDark ? 0.05 : 0.12}
                    wireframe
                />
            </mesh>
            
            {/* Atmosphere glow */}
            <Atmosphere isDark={isDark} />
            
            {/* Outer glow ring */}
            <GlowRing isDark={isDark} />
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


// ===== Individual Event Pin with Enhanced Effects =====
function EventPin({ event, onPinClick, isSelected, isDark }) {
    const pinRef = useRef();
    const glowRef = useRef();
    const ringRef = useRef();
    const [hovered, setHovered] = useState(false);
    const [scale, setScale] = useState(1);
    
    const position = useMemo(
        () => latLonToVector3(event.coordinates.lat, event.coordinates.lon, 1.01),
        [event.coordinates.lat, event.coordinates.lon]
    );
    
    const color = useMemo(
        () => getCategoryColor(event.category),
        [event.category]
    );
    
    useFrame((_, delta) => {
        // Smooth scale animation
        const targetScale = hovered || isSelected ? 2.5 : 1;
        setScale(prev => prev + (targetScale - prev) * delta * 10);
        
        if (pinRef.current) {
            pinRef.current.scale.setScalar(scale);
            // Subtle pulsing animation
            const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.15;
            pinRef.current.scale.multiplyScalar(pulse);
        }
        
        if (glowRef.current) {
            glowRef.current.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.15;
            glowRef.current.scale.setScalar(scale * 1.8);
        }
        
        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 2;
            ringRef.current.material.opacity = hovered || isSelected ? 0.6 : 0.2;
        }
    });
    
    return (
        <group position={position}>
            {/* Core pin */}
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
                <sphereGeometry args={[0.006, 12, 12]} />
                <meshBasicMaterial color={color} />
            </mesh>
            
            {/* Glow effect */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.012, 12, 12]} />
                <meshBasicMaterial 
                    color={color} 
                    transparent 
                    opacity={0.3} 
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            
            {/* Animated ring for selected/hovered */}
            {(hovered || isSelected) && (
                <mesh ref={ringRef}>
                    <ringGeometry args={[0.015, 0.022, 32]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.5}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            )}
            
            {/* Vertical beam for selected */}
            {(hovered || isSelected) && (
                <mesh position={[0, 0.03, 0]}>
                    <cylinderGeometry args={[0.001, 0.003, 0.06, 8]} />
                    <meshBasicMaterial 
                        color={color} 
                        transparent 
                        opacity={0.4}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            )}
            
            {/* HTML Label on hover */}
            {hovered && (
                <Html
                    position={[0, 0.04, 0]}
                    center
                    distanceFactor={4}
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        className="px-3 py-2 rounded-lg shadow-2xl max-w-[220px] whitespace-nowrap animate-in fade-in zoom-in duration-200"
                        style={{
                            background: isDark 
                                ? "rgba(15,17,30,0.95)" 
                                : "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(16px)",
                            border: isDark
                                ? "1px solid rgba(139,92,246,0.3)"
                                : "1px solid rgba(139,92,246,0.2)",
                            boxShadow: isDark
                                ? "0 8px 32px rgba(139,92,246,0.3)"
                                : "0 8px 32px rgba(139,92,246,0.15)",
                        }}
                    >
                        <p className="text-xs font-semibold text-white truncate" style={{ color: isDark ? "#fff" : "#1f2937" }}>
                            {event.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold" style={{ color: color }}>{event.year}</span>
                            <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: color + "20",
                                    color: color,
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
function EventPins({ events, onPinClick, selectedEvent, isDark }) {
    const visibleEvents = useMemo(() => events.slice(0, 1200), [events]);
    
    return (
        <group>
            {visibleEvents.map((event) => (
                <EventPin
                    key={event._id}
                    event={event}
                    onPinClick={onPinClick}
                    isSelected={selectedEvent?._id === event._id}
                    isDark={isDark}
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
            className={`absolute top-4 right-4 z-[1010] p-4 rounded-2xl transition-all duration-300 ${isDark ? "glass-dark" : "glass"}`}
            style={{
                border: isDark
                    ? "1px solid rgba(139,92,246,0.2)"
                    : "1px solid rgba(139,92,246,0.15)",
                background: isDark
                    ? "rgba(15,17,30,0.8)"
                    : "rgba(255,255,255,0.8)",
                backdropFilter: "blur(16px)",
                boxShadow: isDark
                    ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1) inset"
                    : "0 8px 32px rgba(139,92,246,0.1)",
            }}
        >
            <p
                className={`text-[10px] font-bold mb-3 tracking-widest ${isDark ? "text-purple-400" : "text-purple-600"}`}
            >
                CATEGORIES
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {topCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2 group cursor-pointer">
                        <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-white/20 group-hover:scale-125 transition-transform duration-200"
                            style={{ backgroundColor: getCategoryColor(cat) }}
                        />
                        <span
                            className={`text-[11px] capitalize transition-colors duration-200 ${isDark ? "text-white/50 group-hover:text-white" : "text-gray-500 group-hover:text-gray-700"}`}
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
const GlobeComponent = ({ events, selectedEvent, lightMode, onEventSelect, onLoad }) => {
    const isDark = !lightMode;
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [bloomEnabled, setBloomEnabled] = useState(true);
    const [ready, setReady] = useState(false);
    const controlsRef = useRef();
    const cameraRef = useRef();
    
    const activeEvent = selectedEvent;
    
    // Fly to selected event
    useEffect(() => {
        if (selectedEvent && selectedEvent.coordinates && controlsRef.current) {
            const { lat, lon } = selectedEvent.coordinates;
            
            // Calculate the target position
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            
            const targetX = 2.6 * Math.sin(phi) * Math.cos(theta);
            const targetY = 2.6 * Math.cos(phi);
            const targetZ = 2.6 * Math.sin(phi) * Math.sin(theta);
            
            // Animate the camera to face the selected location
            const startTime = Date.now();
            const duration = 1500;
            
            const animateCamera = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                
                // Smoothly interpolate the target
                controlsRef.current.target.lerp(
                    new THREE.Vector3(-targetX, targetY, -targetZ).normalize().multiplyScalar(0.01),
                    easeProgress * 0.1
                );
                
                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
            };
            
            animateCamera();
        }
    }, [selectedEvent]);
    
    useEffect(() => {
        // Give a small delay for initial render, then signal ready
        const timer = setTimeout(() => {
            setReady(true);
            if (onLoad) onLoad();
        }, 500);
        return () => clearTimeout(timer);
    }, [onLoad]);
    
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
            className="relative h-full w-full overflow-hidden"
            style={{ 
                background: isDark 
                    ? "radial-gradient(ellipse at center, #0f1729 0%, #0a0c1a 70%, #050714 100%)" 
                    : "radial-gradient(ellipse at center, #f1f5f9 0%, #e2e8f0 70%, #cbd5e1 100%)" 
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 2.6], fov: 45 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
                dpr={[1, 2]}
            >
                {/* Post-processing */}
                {bloomEnabled && isDark && (
                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.9}
                            intensity={0.8}
                            radius={0.8}
                        />
                    </EffectComposer>
                )}
                
                {/* Lighting */}
                <ambientLight intensity={isDark ? 0.3 : 0.5} />
                <directionalLight
                    position={[5, 3, 5]}
                    intensity={isDark ? 1.2 : 1.4}
                    color={isDark ? "#ffffff" : "#fffaf0"}
                />
                <pointLight
                    position={[-5, -3, -5]}
                    intensity={0.4}
                    color="#6366f1"
                />
                {/* Accent light */}
                <pointLight
                    position={[3, -2, 2]}
                    intensity={0.2}
                    color={isDark ? "#8b5cf6" : "#f59e0b"}
                />
                
                {/* Stars (dark mode) */}
                {isDark && (
                    <Stars
                        radius={100}
                        depth={50}
                        count={4000}
                        factor={5}
                        saturation={0.1}
                        fade
                        speed={0.3}
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
                            isDark={isDark}
                        />
                    )}
                </RotatingGlobeGroupWithPause>
                
                {/* Controls */}
                <OrbitControls
                    ref={controlsRef}
                    enablePan={false}
                    enableZoom={true}
                    minDistance={1.5}
                    maxDistance={5}
                    rotateSpeed={0.5}
                    zoomSpeed={0.8}
                    autoRotate={false}
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>
            
            {/* Category Legend */}
            <CategoryLegend isDark={isDark} />
            
            {/* View toggle: Heatmap vs Pins */}
            <div className="absolute top-4 left-4 z-[1010] flex gap-2">
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${isDark
                        ? "glass-dark text-white/70 hover:text-white hover:bg-white/10"
                        : "glass text-gray-600 hover:text-gray-900 hover:bg-black/5"
                        }`}
                    style={{
                        border: isDark
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(0,0,0,0.1)",
                    }}
                >
                    {showHeatmap ? "📍 Show Pins" : "🌋 Show Density"}
                </button>
                
                {/* Bloom toggle */}
                <button
                    onClick={() => setBloomEnabled(!bloomEnabled)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${isDark
                        ? "glass-dark text-white/50 hover:text-white hover:bg-white/10"
                        : "glass text-gray-500 hover:text-gray-900 hover:bg-black/5"
                        } ${bloomEnabled ? 'ring-1 ring-purple-500/30' : ''}`}
                    style={{
                        border: isDark
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(0,0,0,0.1)",
                    }}
                >
                    ✨ {bloomEnabled ? 'Glow On' : 'Glow Off'}
                </button>
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <div
                    className={`text-xs px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 ${isDark ? "bg-black/30 text-white/50" : "bg-white/50 text-gray-500"}`}
                >
                    Drag to rotate · Scroll to zoom · {showHeatmap ? "Explore density peaks" : "Click pins to explore"}
                </div>
            </div>
        </div>
    );
};

export default GlobeComponent;
