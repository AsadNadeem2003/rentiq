"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bed, Bath, MapPin } from "lucide-react";

// Dynamically import Map with SSR disabled since leaflet requires window
const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
});

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  beds: number;
  baths: number;
  lat: number;
  lng: number;
  mediaUrls: string[];
}

export default function FeedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties`);
        setProperties(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full">
      {/* Property Grid (Left) */}
      <div className="w-1/2 p-6 overflow-y-auto bg-gray-50 border-r">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Property Feed</h1>
          <Link href="/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
            + Add Listing
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No properties found. Be the first to list one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property) => (
              <Link href={`/properties/${property.id}`} key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition group">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {property.mediaUrls[0] ? (
                    <img src={property.mediaUrls[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-xs font-bold rounded shadow-sm">
                    {property.type}
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 truncate mb-1">{property.title}</h2>
                  <p className="text-blue-600 font-bold text-lg mb-3">PKR {property.price.toLocaleString()}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Bed size={16} /> {property.beds}</span>
                    <span className="flex items-center gap-1"><Bath size={16} /> {property.baths}</span>
                    <span className="flex items-center gap-1 truncate"><MapPin size={16} /> {property.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Map View (Right) */}
      <div className="w-1/2 h-full bg-gray-200 z-0">
        <MapView properties={properties} />
      </div>
    </div>
  );
}
