"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useMap } from "react-leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

function SearchField() {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: "bar",
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "Enter address to search",
      keepResult: true,
    });
    
    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, city?: string, area?: string) => void;
}

export default function LocationPickerMap({ onLocationSelect }: LocationPickerMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const handlePositionChange = async (pos: [number, number]) => {
    setPosition(pos);

    // Reverse geocode to get city and area from coordinates
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await response.json();
      const address = data.address || {};

      // Extract city — Nominatim uses different keys depending on the location
      const city =
        address.city ||
        address.town ||
        address.county ||
        address.state_district ||
        "";

      // Extract area/neighborhood — try multiple granularity levels
      const area =
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.village ||
        address.hamlet ||
        address.quarter ||
        "";

      onLocationSelect(pos[0], pos[1], city, area);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      // Still pass lat/lng even if geocoding fails
      onLocationSelect(pos[0], pos[1]);
    }
  };

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border">
      <MapContainer 
        center={[31.5204, 74.3587]} // Lahore default
        zoom={12} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchField />
        <LocationMarker position={position} setPosition={handlePositionChange} />
      </MapContainer>
    </div>
  );
}
