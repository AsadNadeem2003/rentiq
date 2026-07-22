"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bed, Bath, MapPin, Plus, Search, Filter, Layers, Map as MapIcon, Grid } from "lucide-react";
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
  loading: () => <Skeleton className="h-full w-full rounded-2xl" />
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

  const fetchProperties = useCallback(async (overrides?: { type?: string; city?: string; minPrice?: string; maxPrice?: string; beds?: string }) => {
    setLoading(true);
    try {
      const activeCity = overrides?.city !== undefined ? overrides.city : city;
      const activeType = overrides?.type !== undefined ? overrides.type : type;
      const activeMinPrice = overrides?.minPrice !== undefined ? overrides.minPrice : minPrice;
      const activeMaxPrice = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
      const activeBeds = overrides?.beds !== undefined ? overrides.beds : beds;

      const params = new URLSearchParams();
      if (activeCity) params.append("city", activeCity);
      if (activeType && activeType !== "ALL") params.append("type", activeType);
      if (activeMinPrice) params.append("minPrice", activeMinPrice);
      if (activeMaxPrice) params.append("maxPrice", activeMaxPrice);
      if (activeBeds) params.append("beds", activeBeds);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties?${params.toString()}`);
      setProperties(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  }, [city, type, minPrice, maxPrice, beds]);

  // Initial load
  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleTypeChange = (newType: string | null) => {
    const val = newType ?? "ALL";
    setType(val);
    fetchProperties({ type: val });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/70 pb-20">
      {/* Top Banner / Search Header */}
      <div className="bg-white border-b border-gray-100 shadow-xs py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Explore Properties in Pakistan
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Discover verified houses, apartments & plots for rent and sale.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by city (e.g. Lahore, Karachi, Islamabad)..." 
                  className="pl-10 h-11 bg-slate-50/80 border-slate-200 rounded-xl font-medium focus:bg-white transition-all"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`gap-2 h-11 px-4 rounded-xl border-slate-200 font-semibold ${showFilters ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-white text-slate-700'}`}
                >
                  <Filter size={16} /> Filters
                </Button>
                <Button type="submit" className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl">
                  Search
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type</label>
                  <Select value={type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="bg-white h-10 rounded-xl border-slate-200 font-medium">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="RENT">For Rent</SelectItem>
                      <SelectItem value="SALE">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Min Price (PKR)</label>
                  <Input type="number" placeholder="0" className="bg-white h-10 rounded-xl border-slate-200 font-medium" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Max Price (PKR)</label>
                  <Input type="number" placeholder="Any" className="bg-white h-10 rounded-xl border-slate-200 font-medium" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Beds (Min)</label>
                  <Input type="number" placeholder="Any" className="bg-white h-10 rounded-xl border-slate-200 font-medium" value={beds} onChange={(e) => setBeds(e.target.value)} />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Content Area: Landscape Property Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid className="size-5 text-emerald-600" /> Featured Property Listings
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            {properties.length} Listings Found
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-xs bg-white rounded-2xl">
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
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <div className="bg-emerald-50 p-5 rounded-2xl mb-4">
              <MapPin size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
            <p className="text-slate-500 mt-1 max-w-sm text-sm">Try adjusting your filters or be the first to list a property here.</p>
            {showFilters && (
              <Button 
                variant="outline" 
                className="mt-6 rounded-xl border-slate-200"
                onClick={() => {
                  setCity(""); setType("ALL"); setMinPrice(""); setMaxPrice(""); setBeds("");
                  fetchProperties({ city: "", type: "ALL", minPrice: "", maxPrice: "", beds: "" });
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link href={`/properties/${property.id}`} key={property.id} className="block group">
                <Card className={`overflow-hidden rounded-2xl border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col ${property.status !== 'AVAILABLE' ? 'opacity-75 grayscale-[20%]' : ''}`}>
                  {/* 16:9 Landscape Aspect Ratio Thumbnail */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                    {property.mediaUrls && property.mediaUrls.length > 0 ? (
                      <img 
                        src={property.mediaUrls[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-xs">No Image</div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <Badge 
                        className={`shadow-xs font-bold tracking-wider text-[11px] px-2.5 py-0.5 rounded-lg ${property.type === "RENT" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`}
                      >
                        FOR {property.type}
                      </Badge>
                      
                      {property.status !== 'AVAILABLE' && (
                        <Badge 
                          className="shadow-xs font-extrabold tracking-wider text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-lg" 
                        >
                          {property.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 truncate mb-1 group-hover:text-emerald-700 transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-emerald-700 font-extrabold text-lg mb-3">
                      PKR {property.price.toLocaleString()}
                    </p>
                    
                    <div className="flex items-center gap-3.5 text-xs text-slate-600 font-medium mt-auto border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5"><Bed size={15} className="text-slate-400" /> {property.beds} Beds</span>
                      <span className="flex items-center gap-1.5"><Bath size={15} className="text-slate-400" /> {property.baths} Baths</span>
                      <span className="flex items-center gap-1.5 truncate ml-auto font-semibold text-slate-500">
                        <MapPin size={14} className="text-emerald-600 shrink-0" /> 
                        {property.area ? `${property.area}, ${property.city}` : property.city}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Wide Landscape Interactive Map Section Below Feed */}
        <div className="mt-16 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <MapIcon className="size-5 text-emerald-600" /> Interactive Property Map
              </h3>
              <p className="text-xs font-medium text-slate-500">Explore property locations visually across Pakistan.</p>
            </div>
            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50 font-bold px-3 py-1 rounded-full">
              Live Map View
            </Badge>
          </div>

          <div className="h-96 md:h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <MapView properties={properties} />
          </div>
        </div>
      </div>
    </div>
  );
}
