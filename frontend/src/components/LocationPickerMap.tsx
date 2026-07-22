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
      searchLabel: "Search location, city or area...",
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

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await response.json();
      const address = data.address || {};

      const city =
        address.city ||
        address.town ||
        address.county ||
        address.state_district ||
        "";

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
      onLocationSelect(pos[0], pos[1]);
    }
  };

  return (
    <div className="h-72 md:h-80 w-full rounded-2xl overflow-hidden border border-emerald-100/80 shadow-xs relative group bg-emerald-50/20">
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
      
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-200/80 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Set Location on Map
      </div>
    </div>
  );
}
