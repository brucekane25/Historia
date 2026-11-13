"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Html,
  Line,
  OrbitControls,
  Stars,
  useProgress,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  Flame,
  Network,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { getCategoryColor } from "@/lib/category-colors";

// ===== Constants =====
const EARTH_RADIUS = 1;
const PIN_RADIUS = 1.006;
const AUTO_ROTATE_SPEED = 0.055;
const ARC_COLORS = ["#d9553a", "#c9a44c", "#4f9c8a", "#b5657c", "#4a7fa8"];

function latLonToVector3(lat, lon, radius = PIN_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function greatCircleArc(latA, lonA, latB, lonB, radius = PIN_RADIUS, lift = 0.05, segments = 64) {
  const start = latLonToVector3(latA, lonA, 1);
  const end = latLonToVector3(latB, lonB, 1);
  const angle = start.angleTo(end);
  const points = [];

  if (angle < 0.0001 || !Number.isFinite(angle)) {
    return [start.clone().multiplyScalar(radius), end.clone().multiplyScalar(radius)];
  }

  const sinAngle = Math.sin(angle);
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const a = Math.sin((1 - t) * angle) / sinAngle;
    const b = Math.sin(t * angle) / sinAngle;
    const point = start
      .clone()
      .multiplyScalar(a)
      .add(end.clone().multiplyScalar(b))
      .normalize()
      .multiplyScalar(radius * (1 + Math.sin(Math.PI * t) * lift));
    points.push(point);
  }
  return points;
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.72)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ===== Atmosphere =====
function Atmosphere({ isDark }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uInner;
        uniform vec3 uOuter;
        uniform float uIntensity;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float rim = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
          float pulse = 0.92 + 0.08 * sin(uTime * 1.4);
          vec3 color = mix(uInner, uOuter, rim);
          gl_FragColor = vec4(color, rim * uIntensity * pulse);
        }
      `,
      uniforms: {
        uInner: {
          value: new THREE.Color(isDark ? "#17130a" : "#efe7d5"),
        },
        uOuter: {
          value: new THREE.Color(isDark ? "#c9a44c" : "#b8912f"),
        },
        uIntensity: { value: isDark ? 0.62 : 0.4 },
        uTime: { value: 0 },
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [isDark]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ===== Earth =====
function Globe({ isDark, densityTexture, showDensity }) {
  const dayTexture = useLoader(THREE.TextureLoader, "/textures/earth-day.jpg");
  const nightTexture = useLoader(THREE.TextureLoader, "/textures/earth-night.jpg");
  const bumpTexture = useLoader(THREE.TextureLoader, "/textures/earth-bump.png");

  useEffect(() => {
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 8;
    nightTexture.anisotropy = 8;
    bumpTexture.anisotropy = 4;
  }, [dayTexture, nightTexture, bumpTexture]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D bumpTexture;
        uniform sampler2D densityTexture;
        uniform vec3 lightDirection;
        uniform float isDark;
        uniform float showDensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(lightDirection);
          vec3 viewDir = normalize(vViewPosition);

          float ndl = dot(normal, lightDir);
          float dayMix = smoothstep(-0.18, 0.28, ndl);

          vec3 day = texture2D(dayTexture, vUv).rgb;
          vec3 night = texture2D(nightTexture, vUv).rgb;
          float bump = texture2D(bumpTexture, vUv).r;

          vec3 bumpNormal = normalize(normal + vec3(bump * 0.07));
          float diffuse = max(dot(bumpNormal, lightDir), 0.0);
          vec3 dayLit = day * (0.25 + diffuse * 0.95);
          vec3 nightLit = night * (isDark > 0.5 ? 1.8 : 1.1);

          vec3 color;
          if (isDark > 0.5) {
            color = mix(nightLit, dayLit, dayMix);
          } else {
            float daylight = 0.68 + max(ndl, 0.0) * 0.5;
            color = day * daylight + night * 0.04;
          }

          float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
          color += vec3(0.18, 0.32, 0.62) * fresnel * (isDark > 0.5 ? 0.7 : 0.18);

          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(bumpNormal, halfDir), 0.0), 48.0);
          color += vec3(spec * 0.1) * dayMix;

          vec3 density = texture2D(densityTexture, vUv).rgb;
          color += density * showDensity * (isDark > 0.5 ? 1.25 : 0.85);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        bumpTexture: { value: bumpTexture },
        densityTexture: { value: densityTexture },
        showDensity: { value: showDensity ? 1 : 0 },
        lightDirection: {
          value: new THREE.Vector3(5, 2.4, 5).normalize(),
        },
        isDark: { value: isDark ? 1 : 0 },
      },
    });
  }, [dayTexture, nightTexture, bumpTexture, densityTexture, isDark]);

  useEffect(() => {
    if (material.uniforms.showDensity) {
      material.uniforms.showDensity.value = showDensity ? 1 : 0;
    }
  }, [material, showDensity]);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <primitive object={material} attach="material" />
      </mesh>
      <Atmosphere isDark={isDark} />
    </group>
  );
}

// ===== Country borders (local GeoJSON, one draw call) =====
function WorldBorders({ isDark }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/data/countries-110m.geojson");
        if (!res.ok) return;
        const data = await res.json();
        const positions = [];
        const radius = 1.0025;

        const addRing = (ring) => {
          for (let i = 0; i < ring.length - 1; i += 1) {
            const start = latLonToVector3(ring[i][1], ring[i][0], radius);
            const end = latLonToVector3(ring[i + 1][1], ring[i + 1][0], radius);
            positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
          }
        };

        data.features?.forEach((feature) => {
          const geometry = feature.geometry;
          if (!geometry) return;
          if (geometry.type === "Polygon") {
            geometry.coordinates.forEach(addRing);
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((polygon) => polygon.forEach(addRing));
          }
        });

        if (cancelled) return;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );
        setGeometry(geo);
      } catch (error) {
        console.error("Failed to load country borders:", error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={isDark ? "#4f9c8a" : "var(--parchment-dim)"}
        transparent
        opacity={isDark ? 0.2 : 0.24}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ===== Latitude / longitude graticule =====
function Graticule({ isDark }) {
  const geometry = useMemo(() => {
    const positions = [];
    const radius = 1.003;
    const push = (a, b) => {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    };

    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 4) {
        push(
          latLonToVector3(lat, lon, radius),
          latLonToVector3(lat, lon + 4, radius)
        );
      }
    }

    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -90; lat < 90; lat += 4) {
        push(
          latLonToVector3(lat, lon, radius),
          latLonToVector3(lat + 4, lon, radius)
        );
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={isDark ? "#4f9c8a" : "var(--parchment-dim)"}
        transparent
        opacity={isDark ? 0.07 : 0.09}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ===== GPU event point cloud =====
function EventPoints({ events, onEventSelect, isDark }) {
  const [hovered, setHovered] = useState(null);
  const lastHovered = useRef(null);
  const raycaster = useThree((state) => state.raycaster);
  const pixelRatio = useThree((state) => state.gl.getPixelRatio());

  useEffect(() => {
    raycaster.params.Points.threshold = 0.018;
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [raycaster]);

  const { geometry, material, validEvents } = useMemo(() => {
    const valid = (events || []).filter(
      (event) =>
        event?.coordinates &&
        Number.isFinite(event.coordinates.lat) &&
        Number.isFinite(event.coordinates.lon)
    );

    const count = valid.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const color = new THREE.Color();

    valid.forEach((event, index) => {
      const point = latLonToVector3(
        event.coordinates.lat,
        event.coordinates.lon,
        PIN_RADIUS
      );
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;

      color.set(getCategoryColor(event.category));
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;

      sizes[index] = 6.4 + (index % 5) * 0.55;
      phases[index] = (index * 0.61803398875) % 1;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uPointSize;
        varying vec3 vColor;
        varying float vPhase;
        void main() {
          vColor = aColor;
          vPhase = aPhase;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float distanceToCamera = max(0.1, -mvPosition.z);
          float twinkle = 0.8 + 0.2 * sin(uTime * 2.0 + aPhase * 6.28318);
          gl_PointSize = uPointSize * uPixelRatio * twinkle * (2.6 / distanceToCamera);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uDark;
        varying vec3 vColor;
        varying float vPhase;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float distanceToCenter = length(uv);
          if (distanceToCenter > 0.5) discard;

          float core = smoothstep(0.5, 0.0, distanceToCenter);
          float halo = smoothstep(0.5, 0.08, distanceToCenter) * 0.55;
          float sparkle = 0.85 + 0.15 * sin(vPhase * 12.0);
          float alpha = (core * 0.9 + halo * 0.45) * sparkle;
          vec3 color = vColor + vec3(0.35) * pow(core, 5.0);

          gl_FragColor = vec4(color, alpha * (uDark > 0.5 ? 0.95 : 0.82));
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uPointSize: { value: isDark ? 7.2 : 8.6 },
        uDark: { value: isDark ? 1 : 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    return { geometry: geo, material: mat, validEvents: valid };
  }, [events, isDark, pixelRatio]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPixelRatio.value = pixelRatio;
  });

  const handlePointerMove = useCallback(
    (event) => {
      event.stopPropagation();
      const index = event.index;
      if (index == null || !validEvents[index]) return;
      if (lastHovered.current !== index) {
        lastHovered.current = index;
        setHovered(index);
        document.body.style.cursor = "pointer";
      }
    },
    [validEvents]
  );

  const handlePointerOut = useCallback(() => {
    lastHovered.current = null;
    setHovered(null);
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();
      const index = event.index;
      if (index != null && validEvents[index]) {
        onEventSelect?.(validEvents[index]);
      }
    },
    [onEventSelect, validEvents]
  );

  const hoveredEvent = hovered != null ? validEvents[hovered] : null;
  const hoverPosition = useMemo(() => {
    if (!hoveredEvent) return null;
    return latLonToVector3(
      hoveredEvent.coordinates.lat,
      hoveredEvent.coordinates.lon,
      1.04
    );
  }, [hoveredEvent]);

  return (
    <group>
      <points
        geometry={geometry}
        material={material}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {hoveredEvent && hoverPosition && (
        <Html
          position={hoverPosition}
          center
          distanceFactor={2.4}
          zIndexRange={[70, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="max-w-[240px] rounded-[3px] px-3 py-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: "var(--plate)",
              border: isDark
                ? "1px solid color-mix(in srgb, var(--verdigris) 32%, transparent)"
                : "1px solid var(--hairline)",
              boxShadow: isDark
                ? "0 12px 40px color-mix(in srgb, var(--verdigris) 22%, transparent)"
                : "0 12px 30px var(--hairline)",
            }}
          >
            <p
              className="text-[11px] font-semibold leading-snug line-clamp-3"
              style={{ color: "var(--parchment)" }}
            >
              {hoveredEvent.title}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: getCategoryColor(hoveredEvent.category) }}
              >
                {Number.isFinite(hoveredEvent.year) ? hoveredEvent.year : "—"}
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] capitalize"
                style={{
                  background: `${getCategoryColor(hoveredEvent.category)}22`,
                  color: getCategoryColor(hoveredEvent.category),
                }}
              >
                {hoveredEvent.category}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ===== Selected event marker =====
function SelectionMarker({ event, isDark, glowTexture, onEventSelect }) {
  const pulseRef = useRef();
  const ringRef = useRef();
  const beamRef = useRef();

  const position = useMemo(
    () =>
      latLonToVector3(
        event.coordinates.lat,
        event.coordinates.lon,
        1.02
      ),
    [event.coordinates.lat, event.coordinates.lon]
  );

  const normal = useMemo(() => position.clone().normalize(), [position]);
  const ringQuaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
      ),
    [normal]
  );
  const beamQuaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      ),
    [normal]
  );

  const color = getCategoryColor(event.category);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (pulseRef.current) {
      const scale = 0.16 + Math.sin(time * 2.6) * 0.025;
      pulseRef.current.scale.setScalar(scale);
      pulseRef.current.material.opacity = 0.62 + Math.sin(time * 2.6) * 0.18;
    }
    if (ringRef.current) {
      const scale = 1 + Math.sin(time * 2.2) * 0.16;
      ringRef.current.scale.setScalar(scale);
      ringRef.current.material.opacity = 0.45 + Math.sin(time * 2.2) * 0.2;
    }
    if (beamRef.current) {
      beamRef.current.opacity = 0.32 + Math.sin(time * 2.8) * 0.12;
    }
  });

  return (
    <group position={position}>
      <sprite ref={pulseRef} scale={0.16}>
        <spriteMaterial
          map={glowTexture}
          color={color}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <mesh ref={ringRef} quaternion={ringQuaternion}>
        <ringGeometry args={[0.022, 0.032, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh
        position={normal.clone().multiplyScalar(0.055)}
        quaternion={beamQuaternion}
      >
        <cylinderGeometry args={[0.0015, 0.0045, 0.11, 8]} />
        <meshBasicMaterial
          ref={beamRef}
          color={color}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Html
        position={normal.clone().multiplyScalar(0.09)}
        center
        distanceFactor={2.2}
        zIndexRange={[80, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onEventSelect?.(event);
          }}
          className="max-w-[240px] cursor-pointer rounded-[4px] px-3.5 py-2.5 shadow-2xl backdrop-blur-xl transition-transform duration-150 hover:scale-[1.03]"
          style={{
            background: "var(--plate)",
            border: `1px solid ${color}55`,
            boxShadow: `0 16px 50px ${color}33`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ color }}
            >
              {event.category}
            </span>
            <span
              className="ml-auto text-[10px] font-bold tabular-nums"
              style={{ color: isDark ? "var(--parchment)" : "var(--parchment-dim)" }}
            >
              {Number.isFinite(event.year) ? event.year : "—"}
            </span>
          </div>
          <p
            className="mt-1.5 text-[11px] font-medium leading-snug line-clamp-3"
            style={{ color: "var(--parchment)" }}
          >
            {event.title}
          </p>
          <p
            className="mt-1.5 text-[9px]"
            style={{ color: "var(--parchment-dim)" }}
          >
            Click to open details →
          </p>
        </div>
      </Html>
    </group>
  );
}

// ===== Animated connection arcs =====
function ArcComet({ curve, color, glowTexture, offset, speed }) {
  const ref = useRef();
  const progress = useRef(offset);

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1;
    if (ref.current) {
      ref.current.position.copy(curve.getPointAt(progress.current));
    }
  });

  return (
    <sprite
      ref={ref}
      position={curve.getPointAt(offset)}
      scale={0.026}
    >
      <spriteMaterial
        map={glowTexture}
        color={color}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

function ConnectionArcs({ events, isDark, glowTexture }) {
  const arcs = useMemo(() => {
    const valid = (events || []).filter(
      (event) =>
        event?.coordinates &&
        Number.isFinite(event.coordinates.lat) &&
        Number.isFinite(event.coordinates.lon)
    );
    if (valid.length < 2) return [];

    const total = Math.min(9, Math.max(4, Math.floor(valid.length / 90)));
    const result = [];
    const length = valid.length;

    for (let i = 0; i < total; i += 1) {
      const a = valid[(i * 37 + 11) % length];
      const b = valid[(i * 53 + Math.floor(length / 2) + 29) % length];
      if (!a || !b || a._id === b._id) continue;

      const points = greatCircleArc(
        a.coordinates.lat,
        a.coordinates.lon,
        b.coordinates.lat,
        b.coordinates.lon,
        PIN_RADIUS + 0.004,
        0.03 + (i % 4) * 0.012
      );
      const curve = new THREE.CatmullRomCurve3(points);
      result.push({
        id: `${a._id}-${b._id}`,
        curve,
        color: ARC_COLORS[i % ARC_COLORS.length],
        offset: (i / total + 0.12) % 1,
        speed: 0.055 + (i % 3) * 0.018,
      });
    }
    return result;
  }, [events]);

  if (arcs.length === 0) return null;

  return (
    <group>
      {arcs.map((arc) => (
        <group key={arc.id}>
          <Line
            points={arc.curve.getPoints(64)}
            color={arc.color}
            lineWidth={0.95}
            transparent
            opacity={isDark ? 0.24 : 0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
          <ArcComet
            curve={arc.curve}
            color={arc.color}
            glowTexture={glowTexture}
            offset={arc.offset}
            speed={arc.speed}
          />
        </group>
      ))}
    </group>
  );
}

// ===== Density heatmap texture =====
function useDensityTexture(events) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const width = 1024;
    const height = 512;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const radius = 12;

    const drawBlob = (x, y) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(255, 230, 130, 0.55)");
      gradient.addColorStop(0.3, "rgba(255, 130, 45, 0.32)");
      gradient.addColorStop(0.65, "rgba(220, 38, 38, 0.14)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    (events || []).forEach((event) => {
      if (!event?.coordinates) return;
      const { lat, lon } = event.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;

      drawBlob(x, y);
      if (x < radius) drawBlob(x + width, y);
      if (x > width - radius) drawBlob(x - width, y);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }, [events]);

  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

// ===== Star field =====
function Starfield({ isDark }) {
  const width = useThree((state) => state.size.width);
  if (!isDark) return null;
  return (
    <Stars
      radius={90}
      depth={50}
      count={width < 768 ? 2400 : 6500}
      factor={4.5}
      saturation={0.22}
      fade
      speed={0.25}
    />
  );
}

// ===== Rotation / focus controller =====
function GlobeRotation({
  children,
  autoRotate,
  selectedEvent,
  interactingRef,
  resetSignal,
}) {
  const groupRef = useRef();
  const targetQuaternion = useRef(null);
  const resumeAt = useRef(0);

  useEffect(() => {
    if (selectedEvent?.coordinates) {
      const direction = latLonToVector3(
        selectedEvent.coordinates.lat,
        selectedEvent.coordinates.lon,
        1
      ).normalize();
      targetQuaternion.current = new THREE.Quaternion().setFromUnitVectors(
        direction,
        new THREE.Vector3(0, 0, 1)
      );
      resumeAt.current = Infinity;
    } else {
      targetQuaternion.current = null;
      resumeAt.current = performance.now() + 1100;
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (resetSignal > 0) {
      targetQuaternion.current = new THREE.Quaternion();
      resumeAt.current = performance.now() + 400;
    }
  }, [resetSignal]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (targetQuaternion.current) {
      group.quaternion.slerp(
        targetQuaternion.current,
        1 - Math.exp(-delta * 5.5)
      );
      if (group.quaternion.angleTo(targetQuaternion.current) < 0.004) {
        targetQuaternion.current = null;
      }
      return;
    }

    if (
      autoRotate &&
      !interactingRef.current &&
      performance.now() > resumeAt.current
    ) {
      const spin = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        delta * AUTO_ROTATE_SPEED
      );
      group.quaternion.premultiply(spin);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// ===== Small UI helpers =====
function HudButton({ active = false, onClick, icon: Icon, label, isDark }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`pointer-events-auto flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 eyebrow transition-all duration-200 backdrop-blur-xl ${
        active
          ? isDark
            ? "border-cinnabar/50 bg-cinnabar/12 text-cinnabar shadow-[0_0_0_1px_color-mix(in_srgb,var(--cinnabar)_25%,transparent)]"
            : "border-cinnabar/45 bg-cinnabar/10 text-cinnabar"
          : isDark
            ? "border-hairline bg-parchment/4 text-parchment/55 hover:border-hairline-strong hover:bg-parchment/8 hover:text-parchment"
            : "border-hairline bg-plate text-dim hover:border-hairline-strong hover:bg-plate-strong hover:text-parchment"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}

function CategoryLegend({ isDark }) {
  const topCategories = [
    "war",
    "political",
    "scientific",
    "cultural",
    "historical",
    "discoveries",
    "holidays",
    "events",
    "births",
    "deaths",
  ];

  return (
    <div
      className={`pointer-events-auto hidden rounded-[4px] p-3.5 md:block ${
        isDark ? "glass-dark" : "glass"
      }`}
      style={{
        border: isDark
          ? "1px solid color-mix(in srgb, var(--cinnabar) 18%, transparent)"
          : "1px solid color-mix(in srgb, var(--cinnabar) 12%, transparent)",
        background: "var(--plate)",
        backdropFilter: "blur(18px)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.35)"
          : "0 8px 32px color-mix(in srgb, var(--cinnabar) 8%, transparent)",
      }}
    >
      <p
        className={`mb-2.5 text-[9px] font-bold tracking-[0.22em] ${
          isDark ? "text-cinnabar/80" : "text-cinnabar"
        }`}
      >
        CATEGORIES
      </p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        {topCategories.map((category) => (
          <div key={category} className="group flex items-center gap-2">
            <div
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-150"
              style={{
                backgroundColor: getCategoryColor(category),
                boxShadow: `0 0 8px ${getCategoryColor(category)}`,
              }}
            />
            <span
              className={`text-[10px] capitalize transition-colors ${
                isDark
                  ? "text-parchment/45 group-hover:text-parchment/80"
                  : "text-dim group-hover:text-parchment"
              }`}
            >
              {category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Main component =====
const GlobeComponent = ({
  events,
  selectedEvent,
  lightMode,
  onEventSelect,
  onLoad,
}) => {
  const isDark = !lightMode;
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [showArcs, setShowArcs] = useState(true);
  const [bloomEnabled, setBloomEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);

  const controlsRef = useRef();
  const interactingRef = useRef(false);
  const interactionTimeout = useRef();
  const readyRef = useRef(false);
  const onLoadRef = useRef(onLoad);

  const { active, progress } = useProgress();

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  const glowTexture = useMemo(
    () => (typeof document !== "undefined" ? makeGlowTexture() : null),
    []
  );
  const densityTexture = useDensityTexture(events);

  useEffect(
    () => () => {
      glowTexture?.dispose();
      clearTimeout(interactionTimeout.current);
    },
    [glowTexture]
  );

  const signalReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    onLoadRef.current?.();
  }, []);

  useEffect(() => {
    const timer = setTimeout(signalReady, 1200);
    return () => clearTimeout(timer);
  }, [signalReady]);

  useEffect(() => {
    if (!active && progress >= 100) signalReady();
  }, [active, progress, signalReady]);

  const stats = useMemo(() => {
    const coordinates = (events || []).filter((event) => event?.coordinates);
    const categories = new Set();
    let minYear = Infinity;
    let maxYear = -Infinity;

    coordinates.forEach((event) => {
      if (event.category) categories.add(event.category);
      if (Number.isFinite(event.year)) {
        minYear = Math.min(minYear, event.year);
        maxYear = Math.max(maxYear, event.year);
      }
    });

    return {
      count: coordinates.length,
      categories: categories.size,
      hasYears: Number.isFinite(minYear),
      minYear: Number.isFinite(minYear) ? minYear : 0,
      maxYear: Number.isFinite(maxYear) ? maxYear : 0,
    };
  }, [events]);

  const handleControlStart = useCallback(() => {
    interactingRef.current = true;
    clearTimeout(interactionTimeout.current);
  }, []);

  const handleControlEnd = useCallback(() => {
    clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => {
      interactingRef.current = false;
    }, 1400);
  }, []);

  const handleReset = useCallback(() => {
    setResetSignal((value) => value + 1);
    controlsRef.current?.reset();
  }, []);

  const handleTogglePins = useCallback(() => {
    setShowPins(true);
    setShowHeatmap(false);
  }, []);

  const handleToggleHeatmap = useCallback(() => {
    setShowHeatmap(true);
    setShowPins(false);
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at 50% 45%, #131a17 0%, #0d1110 55%, #070a09 100%)"
          : "radial-gradient(ellipse at 50% 45%, #f6f1e4 0%, #efe9da 60%, #e5decb 100%)",
      }}
    >
      {/* Ambient light blooms behind the canvas */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[14%] top-[8%] h-[42%] w-[42%] rounded-full blur-[110px]"
          style={{
            background: isDark
              ? "color-mix(in srgb, var(--verdigris) 13%, transparent)"
              : "color-mix(in srgb, var(--cinnabar) 10%, transparent)",
          }}
        />
        <div
          className="absolute -right-[10%] bottom-[2%] h-[38%] w-[38%] rounded-full blur-[120px]"
          style={{
            background: isDark
              ? "color-mix(in srgb, var(--cinnabar) 16%, transparent)"
              : "color-mix(in srgb, var(--verdigris) 10%, transparent)",
          }}
        />
        <div
          className="absolute left-[38%] top-[42%] h-[26%] w-[26%] rounded-full blur-[100px]"
          style={{
            background: isDark
              ? "color-mix(in srgb, var(--verdigris) 7%, transparent)"
              : "color-mix(in srgb, var(--verdigris) 6%, transparent)",
          }}
        />
      </div>

      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 3.35], fov: 42 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
          dpr={[1, 1.85]}
          onCreated={({ camera }) => {
            if (typeof window === "undefined") return;
            const aspect = window.innerWidth / window.innerHeight;
            const distance = aspect < 0.62 ? 6.4 : aspect < 0.9 ? 4.4 : 3.35;
            camera.position.set(0, 0, distance);
            camera.updateProjectionMatrix();
          }}
        >
          <Suspense fallback={null}>
            <Starfield isDark={isDark} />

            <ambientLight intensity={isDark ? 0.22 : 0.5} />
            <directionalLight
              position={[5, 2.4, 5]}
              intensity={isDark ? 1.15 : 1.35}
              color={"var(--parchment)"}
            />
            <pointLight
              position={[-5, -3, -5]}
              intensity={isDark ? 0.5 : 0.3}
              color="#d9553a"
            />
            <pointLight
              position={[3, -2, 2]}
              intensity={0.25}
              color={isDark ? "#d9553a" : "#c9a44c"}
            />

            <GlobeRotation
              autoRotate={autoRotate}
              selectedEvent={selectedEvent}
              interactingRef={interactingRef}
              resetSignal={resetSignal}
            >
              <Globe
                isDark={isDark}
                densityTexture={densityTexture}
                showDensity={showHeatmap}
              />
              <Graticule isDark={isDark} />
              <WorldBorders isDark={isDark} />

              {showPins && (
                <EventPoints
                  events={events}
                  onEventSelect={onEventSelect}
                  isDark={isDark}
                />
              )}

              {showArcs && (
                <ConnectionArcs
                  events={events}
                  isDark={isDark}
                  glowTexture={glowTexture}
                />
              )}

              {selectedEvent?.coordinates && (
                <SelectionMarker
                  event={selectedEvent}
                  isDark={isDark}
                  glowTexture={glowTexture}
                  onEventSelect={onEventSelect}
                />
              )}
            </GlobeRotation>

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom
              minDistance={2.35}
              maxDistance={7.2}
              rotateSpeed={0.45}
              zoomSpeed={0.7}
              enableDamping
              dampingFactor={0.06}
              onStart={handleControlStart}
              onEnd={handleControlEnd}
            />

            {bloomEnabled && isDark && (
              <EffectComposer>
                <Bloom
                  luminanceThreshold={0.16}
                  luminanceSmoothing={0.85}
                  intensity={1.05}
                  radius={0.78}
                  mipmapBlur
                />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: isDark
            ? "inset 0 0 180px 40px rgba(0,0,0,0.55)"
            : "inset 0 0 160px 30px color-mix(in srgb, var(--parchment) 22%, transparent)",
        }}
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1010] flex items-start justify-between gap-3 px-3 pb-3 pt-20 lg:px-5 lg:pb-5 lg:pt-24">
        <div className="max-w-[280px]">
          <div
            className={`pointer-events-auto rounded-[4px] p-3.5 ${
              isDark ? "glass-dark" : "glass"
            }`}
            style={{
              border: isDark
                ? "1px solid color-mix(in srgb, var(--verdigris) 18%, transparent)"
                : "1px solid var(--hairline)",
              background: "var(--plate)",
              backdropFilter: "blur(18px)",
              boxShadow: isDark
                ? "0 10px 40px rgba(0,0,0,0.35)"
                : "0 10px 30px var(--hairline)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verdigris opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-verdigris" />
              </span>
              <span
                className={`text-[9px] font-bold tracking-[0.24em] ${
                  isDark ? "text-parchment/65" : "text-dim"
                }`}
              >
                LIVE HISTORY NETWORK
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-semibold tabular-nums leading-none ${
                  "text-parchment"
                }`}
              >
                {stats.count.toLocaleString()}
              </span>
              <span
                className={`text-[10px] ${
                  isDark ? "text-parchment/45" : "text-dim"
                }`}
              >
                events on the globe
              </span>
            </div>

            <div
              className={`mt-1.5 flex items-center gap-2 text-[9px] ${
                isDark ? "text-parchment/35" : "text-dim"
              }`}
            >
              <span>{stats.categories} {stats.categories === 1 ? "category" : "categories"}</span>
              <span className="opacity-30">·</span>
              <span className="tabular-nums">
                {stats.hasYears ? `${stats.minYear} → ${stats.maxYear}` : "—"}
              </span>
            </div>
          </div>

          <div className="pointer-events-auto mt-2 flex flex-wrap gap-1.5">
            <HudButton
              isDark={isDark}
              active={autoRotate}
              onClick={() => setAutoRotate((value) => !value)}
              icon={autoRotate ? Pause : Play}
              label={autoRotate ? "Auto" : "Paused"}
            />
            <HudButton
              isDark={isDark}
              active={showArcs}
              onClick={() => setShowArcs((value) => !value)}
              icon={Network}
              label="Arcs"
            />
            <HudButton
              isDark={isDark}
              active={showPins}
              onClick={handleTogglePins}
              icon={Sparkles}
              label="Pins"
            />
            <HudButton
              isDark={isDark}
              active={showHeatmap}
              onClick={handleToggleHeatmap}
              icon={Flame}
              label="Density"
            />
            <HudButton
              isDark={isDark}
              active={bloomEnabled}
              onClick={() => setBloomEnabled((value) => !value)}
              icon={Sparkles}
              label="Glow"
            />
            <HudButton
              isDark={isDark}
              onClick={handleReset}
              icon={RotateCcw}
              label="Reset"
            />
            {selectedEvent && (
              <HudButton
                isDark={isDark}
                onClick={() => onEventSelect?.(null)}
                icon={X}
                label="Clear"
              />
            )}
          </div>
        </div>

        <CategoryLegend isDark={isDark} />
      </div>

      {/* Bottom hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[1010] flex justify-center px-4">
        <div
          className={`rounded-full px-4 py-2 text-[10px] backdrop-blur-xl ${
            isDark ? "bg-black/35 text-parchment/45" : "bg-plate text-dim"
          }`}
          style={{
            border: isDark
              ? "1px solid color-mix(in srgb, var(--parchment) 7%, transparent)"
              : "1px solid var(--hairline)",
          }}
        >
          Drag to orbit · Scroll to zoom · Click a light to explore
          {selectedEvent ? " · Focused on selected event" : ""}
        </div>
      </div>
    </div>
  );
};

export default GlobeComponent;