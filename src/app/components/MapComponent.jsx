"use client"

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
// import world from "../assets/countries.js";
import { GeoJSON } from "react-leaflet";
import india_outline from "../assets/India_Outline_Map.js";
import { themes } from "../themes/colorThemes.js";
import Image from "next/image.js";

const MapComponent = ({ events, selectedEvent, mode }) => {
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
  const [filteredEvents, setFilteredEvents] = useState([]);
  const geoJsonRef = useRef(null); // Ref to store the GeoJSON layer

  // Reset clusters, markers, and GeoJSON when the country changes
  // useEffect(() => {
  //   if (country != null && world.features[country]) {
  //     // Clear the previous GeoJSON layer
  //     if (geoJsonRef.current) {
  //       geoJsonRef.current.remove(); // Remove the previous GeoJSON layer
  //     }

  //     // Filter events for the new country
  //     const geoJsonLayer = L.geoJSON(world.features[country]);
  //     const filtered = events.filter((event) =>
  //       geoJsonLayer.getBounds().contains([event.coordinates.lat, event.coordinates.lon])
  //     );
  //     setFilteredEvents(filtered);

  //     // Clear the previous markers and clusters
  //     if (clusterGroupRef.current) {
  //       clusterGroupRef.current.clearLayers();
  //     }
  //   } else {
  //     // If no country is selected, show all events
  //     setFilteredEvents(events);
  //   }
  // }, [country, events]);

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
        } else {
          console.warn("Marker not found or not part of the cluster group.");
        }
      }
    }, [selectedEvent, map]);

    return null;
  };

  // const CountryFocus = ({ country }) => {
  //   const map = useMap();

  //   useEffect(() => {
  //     if (country != null && world.features[country]) {
  //       const bounds = L.geoJSON(world.features[country]).getBounds();
  //       map.fitBounds(bounds, { padding: [50, 50] });
  //     }
  //   }, [country, map]);

  //   return null;
  // };

  useEffect(() => {
    // Select the Leaflet zoom controls
    const zoomInButton = document.querySelector(".leaflet-control-zoom-in");
    const zoomOutButton = document.querySelector(".leaflet-control-zoom-out");
    const layerControl = document.querySelector(".leaflet-control-layers");
  
    // Apply styles dynamically
    if (zoomInButton && zoomOutButton) {
      [zoomInButton, zoomOutButton].forEach((btn) => {
        btn.style.backgroundColor = mode ? themes.light.background : themes.dark.background;
        btn.style.color = mode ? "black" : "white";
        btn.style.border = "none";
        // btn.style.borderRadius = "8px";
        btn.style.transition = "all 0.3s ease";
      });
    }
  
    if (layerControl) {
      layerControl.style.backgroundColor = mode ?  themes.light.background : themes.dark.background;
      // layerControl.style.color = mode === "dark" ? "#fff" : "#000";
      layerControl.style.borderRadius = "8px";
      layerControl.style.padding = "5px";
    }
  }, [mode]); // Runs whenever mode changes
  


  useEffect(() => {
    const mapContainer = document.querySelector(".leaflet-container");
    if (mapContainer) {
      mapContainer.style.backgroundColor = mode ? "white" : "black";
    }
  }, [mode]);

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
    >
      <LayersControl position="topright">
        <LayersControl.Overlay name="OpenStreetMap">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?key=2b4nj2gRRkpUERQZxBXB"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay  name="MapTiler">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">MapTiler</a>'
            url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=pUdLG48OR57uT9vDP5mK"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={!mode} name="CartoCDN-dark">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">ThunderForestMaps</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={mode} name="Detailed">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">ThunderForestMaps</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay name="LightGray">
          <TileLayer
            attribution='<a href="https://www.maptiler.com/copyright">ThunderForestMaps</a>'
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.Overlay>
      </LayersControl>

      {/* India Outline */}
      <GeoJSON
        data={india_outline}
        style={{
          color: mode ? "black" : "grey",
          weight: 1/8 ,
          opacity: 1,
          fillOpacity: 0,
        }}
      />

      {/* Country GeoJSON */}
      {/* {country && world.features[country] && (
        <GeoJSON
          key={country} // Force remount on country change
          data={world.features[country]}
          ref={geoJsonRef} // Store the GeoJSON layer in a ref
          style={{
            color: mode ? "black" : "grey",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
          }}
        />
      )} */}

      {/* MarkerClusterGroup */}
      <MarkerClusterGroup
        // key={country} // Force remount on country change
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
            ref={(marker) => {
              if (marker) {
                markersRef.current[event._id] = marker;
              }
            }}
          >
            <Popup>
              <div style={{backgroundColor:mode?'white':themes.dark.sbackground}} className="min-w-[370px] max-w-2xl p-4 rounded-lg shadow-2xl">
                <div className="flex flex-row gap-6">
                  {event.thumbnail && (
                    <Image
                      width={`160`}
                      height={`160`}
                      className="object-cover rounded-md flex-shrink"
                      src={event.thumbnail}
                      alt={event.title || "Event Thumbnail"}
                    />
                  )}

                  <div className="flex flex-col justify-between gap-3 flex-grow">
                    <div>
                      <h3 style={{color:mode?themes.light.text:themes.dark.text}} className="text-base line-clamp-6 font-normal">
                        {event.title}
                      </h3>
                      <a
                        href={`https://en.wikipedia.org/?curid=${event.pageID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline text-sm"
                      >
                        Know More
                      </a>
                    </div>
                    <div  style={{color:mode?themes.light.text:themes.dark.text}} className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold ">
                        {event.year}
                      </h3>
                      <h3 className="text-base font-medium ">
                        {event.category}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      <MapUpdater selectedEvent={selectedEvent} />
      {/* <CountryFocus country={country} /> */}
    </MapContainer>
  );
};

export default MapComponent;