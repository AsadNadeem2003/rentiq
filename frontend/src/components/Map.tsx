"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";

// Fix missing marker icons in leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  lat: number;
  lng: number;
  mediaUrls: string[];
}

export default function Map({ properties }: { properties: Property[] }) {
  useEffect(() => {
    // Re-render map when properties change to ensure bounds updates
  }, [properties]);

  const defaultCenter: [number, number] = properties.length > 0 
    ? [properties[0].lat, properties[0].lng] 
    : [31.5204, 74.3587]; // Default to Lahore, Pakistan

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={12} 
      scrollWheelZoom={true} 
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => (
        <Marker 
          key={property.id} 
          position={[property.lat, property.lng]} 
          icon={customIcon}
        >
          <Popup>
            <div className="w-48">
              {property.mediaUrls[0] && (
                <img 
                  src={property.mediaUrls[0]} 
                  alt={property.title} 
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="font-bold text-sm truncate">{property.title}</h3>
              <p className="text-gray-600 text-xs">{property.city}</p>
              <p className="font-semibold text-blue-600 mt-1">PKR {property.price.toLocaleString()}</p>
              <Link 
                href={`/properties/${property.id}`}
                className="block text-center bg-blue-600 text-white py-1 px-2 rounded mt-2 hover:bg-blue-700 transition"
              >
                View Detail
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
