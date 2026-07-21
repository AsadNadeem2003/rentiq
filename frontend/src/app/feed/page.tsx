"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bed, Bath, MapPin, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamically import Map with SSR disabled since leaflet requires window
const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />
});

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  status: string;
  city: string;
  area?: string;
  beds: number;
  baths: number;
  lat: number;
  lng: number;
  mediaUrls: string[];
}

export default function FeedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [city, setCity] = useState("");
  const [type, setType] = useState("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (type !== "ALL") params.append("type", type);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (beds) params.append("beds", beds);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties?${params.toString()}`);
      setProperties(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  }, [city, type, minPrice, maxPrice, beds]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50/50">
      {/* Property Grid (Left) */}
      <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto border-r shadow-sm z-10 bg-white flex flex-col">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/90 backdrop-blur-md pb-2 pt-2 z-20">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Property Feed</h1>
          <Link href="/properties/new">
            <Button className="gap-2 shadow-sm font-semibold h-9 md:h-10 text-xs md:text-sm">
              <Plus size={16} /> <span className="hidden sm:inline">Add Listing</span>
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by city..." 
                className="pl-9 bg-gray-50 border-gray-200"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 ${showFilters ? 'bg-gray-100' : ''}`}
            >
              <Filter size={16} /> <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="RENT">For Rent</SelectItem>
                    <SelectItem value="SALE">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase">Min Price</label>
                <Input type="number" placeholder="0" className="bg-white" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase">Max Price</label>
                <Input type="number" placeholder="Any" className="bg-white" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase">Beds (Min)</label>
                <Input type="number" placeholder="Any" className="bg-white" value={beds} onChange={(e) => setBeds(e.target.value)} />
              </div>
            </div>
          )}
        </form>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-sm bg-gray-50/50">
                  <Skeleton className="h-48 w-full rounded-b-none" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-1/3" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <MapPin size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
              <p className="text-gray-500 mt-2 max-w-sm">Try adjusting your filters or be the first to list a property here.</p>
              {showFilters && (
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => {
                    setCity(""); setType("ALL"); setMinPrice(""); setMaxPrice(""); setBeds("");
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
              {properties.map((property) => (
                <Link href={`/properties/${property.id}`} key={property.id}>
                  <Card className={`overflow-hidden group hover:shadow-md hover:border-gray-300 transition-all duration-300 h-full flex flex-col ${property.status !== 'AVAILABLE' ? 'opacity-70 grayscale-[30%]' : ''}`}>
                    <div className="h-48 relative overflow-hidden bg-gray-100">
                      {property.mediaUrls && property.mediaUrls.length > 0 ? (
                        <img 
                          src={property.mediaUrls[0]} 
                          alt={property.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">No Image</div>
                      )}
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge 
                          className="shadow-sm font-bold tracking-wide w-fit" 
                          variant={property.type === "RENT" ? "secondary" : "default"}
                        >
                          FOR {property.type}
                        </Badge>
                        
                        {property.status !== 'AVAILABLE' && (
                          <Badge 
                            className="shadow-sm font-black tracking-widest text-[10px] w-fit bg-red-600 text-white hover:bg-red-700" 
                          >
                            {property.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h2 className="text-lg font-bold text-gray-900 truncate mb-1 group-hover:text-primary transition-colors">{property.title}</h2>
                      <p className="text-primary font-bold text-xl mb-4">PKR {property.price.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-medium mt-auto border-t pt-3">
                        <span className="flex items-center gap-1.5"><Bed size={16} className="text-gray-400" /> {property.beds}</span>
                        <span className="flex items-center gap-1.5"><Bath size={16} className="text-gray-400" /> {property.baths}</span>
                        <span className="flex items-center gap-1.5 truncate ml-auto"><MapPin size={16} className="text-gray-400" /> {property.area ? `${property.area}, ${property.city}` : property.city}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map View (Right) */}
      <div className="hidden md:block w-1/2 h-full bg-gray-100 z-0 border-l relative shadow-inner">
        <MapView properties={properties} />
      </div>
    </div>
  );
}
