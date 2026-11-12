"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  GeoJSON,
  LayersControl,
  MapContainer,
  Marker,
  ScaleControl,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import india_outline from "../assets/India_Outline_Map.js";
import { getCategoryColor } from "@/lib/category-colors";

// Keyless raster providers. No API keys, no accounts.
const TILES = {
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 19,
  },
  light: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 19,
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, USGS, NOAA',
    maxZoom: 15,
  },
};

const markerIcons = new Map();

function getMarkerIcon(category, selected = false) {
  const key = `${category || "default"}:${selected ? "selected" : "normal"}`;
  if (markerIcons.has(key)) return markerIcons.get(key);

  const color = getCategoryColor(category);
  const size = selected ? 28 : 18;

  const icon = L.divIcon({
    className: "gloria-marker-wrapper",
    html: `
      <span class="gloria-marker${selected ? " is-selected" : ""}" style="--marker-color:${color};width:${size}px;height:${size}px">
        <span class="gloria-marker-halo"></span>
        <span class="gloria-marker-dot"></span>
      </span>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  markerIcons.set(key, icon);
  return icon;
}

function createClusterIcon(cluster, isDark) {
  const count = cluster.getChildCount();
  const size = count > 500 ? 54 : count > 100 ? 46 : count > 10 ? 38 : 30;
  const color = isDark ? "#22d3ee" : "#6366f1";

  return L.divIcon({
    className: "gloria-cluster-wrapper",
    html: `
      <div class="gloria-cluster" style="--cluster-color:${color};width:${size}px;height:${size}px">
        <span class="gloria-cluster-ring"></span>
        <span class="gloria-cluster-count">${count > 999 ? `${(count / 1000).toFixed(1)}k` : count}</span>
      </div>
    `,
    iconSize: [size, size],
  });
}

function MapUpdater({ focusedEvent, markersRef, clusterGroupRef }) {
  const map = useMap();

  useEffect(() => {
    if (!focusedEvent?.coordinates) return;
    const { lat, lon } = focusedEvent.coordinates;
    map.flyTo([lat, lon], Math.max(map.getZoom(), 5), {
      duration: 1.4,
      easeLinearity: 0.25,
    });

    const timer = setTimeout(() => {
      const marker = markersRef.current[focusedEvent._id];
      if (marker && clusterGroupRef.current) {
        clusterGroupRef.current.zoomToShowLayer(marker, () => {
          marker.openTooltip?.();
        });
      }
    }, 1300);

    return () => clearTimeout(timer);
  }, [focusedEvent?._id, map, markersRef, clusterGroupRef]);

  return null;
}

const MapComponent = ({ events, selectedEvent, lightMode, onEventSelect }) => {
  const isDark = !lightMode;
  const markersRef = useRef({});
  const clusterGroupRef = useRef(null);

  const iconCache = useMemo(() => {
    const icons = {};
    const categories = new Set(
      (events || []).map((event) => event.category || "default")
    );
    categories.forEach((category) => {
      icons[`${category}:normal`] = getMarkerIcon(category, false);
      icons[`${category}:selected`] = getMarkerIcon(category, true);
    });
    return icons;
  }, [events]);

  const iconCreateFunction = useCallback(
    (cluster) => createClusterIcon(cluster, isDark),
    [isDark]
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20, 10]}
        zoom={2.5}
        minZoom={2}
        maxZoom={19}
        worldCopyJump
        preferCanvas
        zoomControl={false}
        maxBounds={[
          [-90, -280],
          [90, 280],
        ]}
        maxBoundsViscosity={1}
        style={{ height: "100%", width: "100%", background: isDark ? "#070b16" : "#eef2f7" }}
      >
        <LayersControl position="topright" key={isDark ? "dark" : "light"}>
          <LayersControl.BaseLayer checked={isDark} name="Dark canvas">
            <TileLayer
              url={TILES.dark.url}
              attribution={TILES.dark.attribution}
              maxZoom={TILES.dark.maxZoom}
              detectRetina
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked={!isDark} name="Light canvas">
            <TileLayer
              url={TILES.light.url}
              attribution={TILES.light.attribution}
              maxZoom={TILES.light.maxZoom}
              detectRetina
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              url={TILES.streets.url}
              attribution={TILES.streets.attribution}
              maxZoom={TILES.streets.maxZoom}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url={TILES.satellite.url}
              attribution={TILES.satellite.attribution}
              maxZoom={TILES.satellite.maxZoom}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              url={TILES.terrain.url}
              attribution={TILES.terrain.attribution}
              maxZoom={TILES.terrain.maxZoom}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        <GeoJSON
          data={india_outline}
          style={{
            color: isDark ? "#94a3b8" : "#334155",
            weight: 0.6,
            opacity: 0.6,
            fillOpacity: 0,
          }}
        />

        <MarkerClusterGroup
          ref={clusterGroupRef}
          disableClusteringAtZoom={9}
          maxClusterRadius={58}
          iconCreateFunction={iconCreateFunction}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          removeOutsideVisibleBounds
          chunkedLoading
          animate
        >
          {(events || []).map((event) => {
            if (!event?.coordinates) return null;
            const selected = selectedEvent?._id === event._id;
            const category = event.category || "default";

            return (
              <Marker
                key={event._id}
                icon={iconCache[`${category}:${selected ? "selected" : "normal"}`]}
                position={[event.coordinates.lat, event.coordinates.lon]}
                riseOnHover
                title={event.title}
                zIndexOffset={selected ? 1000 : 0}
                eventHandlers={{
                  click: () => onEventSelect(event),
                }}
                ref={(marker) => {
                  if (marker) markersRef.current[event._id] = marker;
                }}
              />
            );
          })}
        </MarkerClusterGroup>

        {selectedEvent?.coordinates &&
          !(events || []).some((event) => event._id === selectedEvent._id) && (
            <Marker
              icon={getMarkerIcon(selectedEvent.category || "default", true)}
              position={[
                selectedEvent.coordinates.lat,
                selectedEvent.coordinates.lon,
              ]}
              riseOnHover
              title={selectedEvent.title}
              zIndexOffset={1000}
              eventHandlers={{
                click: () => onEventSelect(selectedEvent),
              }}
            />
          )}

        <MapUpdater
          focusedEvent={selectedEvent}
          markersRef={markersRef}
          clusterGroupRef={clusterGroupRef}
        />
      </MapContainer>

      {/* Map HUD */}
      <div className="pointer-events-none absolute bottom-24 left-4 z-[500] hidden sm:block">
        <div
          className={`pointer-events-auto rounded-2xl px-3.5 py-2.5 backdrop-blur-xl ${
            isDark ? "glass-dark" : "glass"
          }`}
          style={{
            border: isDark
              ? "1px solid rgba(34,211,238,0.18)"
              : "1px solid rgba(15,23,42,0.08)",
            background: isDark
              ? "rgba(9,13,26,0.78)"
              : "rgba(255,255,255,0.82)",
            boxShadow: isDark
              ? "0 10px 34px rgba(0,0,0,0.32)"
              : "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <span
              className={`text-[9px] font-bold tracking-[0.22em] ${
                isDark ? "text-cyan-200/80" : "text-cyan-700"
              }`}
            >
              LIVE MAP
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span
              className={`text-xl font-semibold tabular-nums leading-none ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {(events?.length || 0).toLocaleString()}
            </span>
            <span
              className={`text-[10px] ${isDark ? "text-white/45" : "text-gray-500"}`}
            >
              events plotted
            </span>
          </div>
          <p
            className={`mt-1 text-[9px] ${isDark ? "text-white/30" : "text-gray-400"}`}
          >
            No API key required
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;