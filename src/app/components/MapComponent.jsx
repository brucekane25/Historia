"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { GeoJSON } from "react-leaflet";
import india_outline from "../assets/India_Outline_Map.js";

const MapComponent = ({ events, selectedEvent, lightMode, onEventSelect }) => {
  const isDark = !lightMode;

  const customIcon = L.icon({
    iconUrl: "/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const defaultPosition = [0, 0];
  const markersRef = useRef({});
  const clusterGroupRef = useRef(null);

  const MapUpdater = ({ selectedEvent }) => {
    const map = useMap();

    useEffect(() => {
      if (selectedEvent) {
        const marker = markersRef.current[selectedEvent._id];
        const clusterGroup = clusterGroupRef.current;

        if (marker && clusterGroup) {
          setTimeout(() => {
            clusterGroup.zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          }, 100);
        }
      }
    }, [selectedEvent, map]);

    return null;
  };

  return (
    <MapContainer
      center={defaultPosition}
      zoom={3}
      worldCopyJump={false}
      minZoom={2}
      maxBounds={[
        [-90, -280],
        [90, 280],
      ]}
      maxBoundsViscosity={1}
      style={{ margin: 0, padding: 0, minHeight: "100%", width: "100%" }}
      className={isDark ? "dark" : ""}
    >
      <LayersControl position="topright">
        <LayersControl.Overlay name="OpenStreetMap">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?key=2b4nj2gRRkpUERQZxBXB"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="MapTiler">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">MapTiler</a>'
            url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=pUdLG48OR57uT9vDP5mK"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={isDark} name="CartoCDN-dark">
          <TileLayer
            attribution='<a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={!isDark} name="Detailed">
          <TileLayer
            attribution='<a href="https://www.esri.com">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="LightGray">
          <TileLayer
            attribution='<a href="https://www.esri.com">Esri</a>'
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.Overlay>
      </LayersControl>

      {/* India Outline */}
      <GeoJSON
        data={india_outline}
        style={{
          color: isDark ? "grey" : "black",
          weight: 1 / 8,
          opacity: 1,
          fillOpacity: 0,
        }}
      />

      {/* MarkerClusterGroup */}
      <MarkerClusterGroup
        ref={clusterGroupRef}
        disableClusteringAtZoom={9}
        maxClusterRadius={60}
        animate
      >
        {events.map((event) => (
          <Marker
            key={event._id}
            icon={customIcon}
            position={[event.coordinates.lat, event.coordinates.lon]}
            eventHandlers={{
              click: () => onEventSelect(event)
            }}
            ref={(marker) => {
              if (marker) {
                markersRef.current[event._id] = marker;
              }
            }}
          />
        ))}
      </MarkerClusterGroup>

      <MapUpdater selectedEvent={selectedEvent} />
    </MapContainer>
  );
};

export default MapComponent;