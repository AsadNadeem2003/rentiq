"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Bed, Bath, MapPin, Loader2, MessageCircle, BadgeCheck, Users, Navigation, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  status: string;
  city: string;
  area?: string;
  beds: number;
  baths: number;
  lat?: number;
  lng?: number;
  isRoommateAllowed?: boolean;
  roommatesCount?: number;
  mediaUrls: string[];
  ownerId: string;
  owner: {
    id: string;
    name: string;
    isVerified?: boolean;
  };
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  
  const { token, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Failed to fetch property", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleMessageOwner = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    setMessaging(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        { propertyId: property?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      router.push(`/chat/${response.data.id}`);
    } catch (error) {
      console.error("Failed to start conversation", error);
      alert("Could not start conversation.");
    } finally {
      setMessaging(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!property) return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${property.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperty((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success(`Property marked as ${newStatus.toLowerCase()}!`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update property status");
    }
  };

  const handleDeleteProperty = async () => {
    if (!property) return;
    if (!confirm("Are you sure you want to delete this property listing? This action cannot be undone.")) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/properties/${property.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Property listing deleted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete property", error);
      toast.error("Failed to delete property listing.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 mt-8">
        <Card className="border-0 shadow-lg">
          <Skeleton className="h-96 w-full rounded-b-none" />
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="flex gap-8 border-y py-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Property not found</h2>
        <Button onClick={() => router.push("/feed")}>Back to Feed</Button>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.sub === property.ownerId;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 mt-4 mb-16">
      
      {/* Title Header (Mobile & Desktop) */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{property.title}</h1>
        <p className="flex items-center text-muted-foreground font-medium text-lg gap-1.5">
          <MapPin size={20} /> {property.area ? `${property.area}, ${property.city}` : property.city}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Image Gallery & Details */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Image Gallery */}
          <div className="w-full aspect-video bg-black/95 rounded-xl overflow-hidden flex overflow-x-auto snap-x snap-mandatory hide-scrollbar relative shadow-md border">
            {property.mediaUrls && property.mediaUrls.length > 0 ? (
              property.mediaUrls.map((url, idx) => (
                <div key={idx} className="h-full flex-shrink-0 w-full snap-center flex items-center justify-center p-0 md:p-2">
                  <img src={url} alt={`Property view ${idx + 1}`} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No media available</div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className="shadow-md text-sm py-1 px-3 font-bold w-fit" variant={property.type === "RENT" ? "secondary" : "default"}>
                FOR {property.type}
              </Badge>
              {property.status !== 'AVAILABLE' && (
                <Badge className="shadow-md text-sm py-1 px-3 font-black tracking-widest w-fit bg-red-600 text-white hover:bg-red-700">
                  {property.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Core Specs */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-8 text-gray-700">
                <div className="flex items-center gap-3 text-lg font-semibold"><Bed size={28} className="text-muted-foreground/70" /> {property.beds} Bedrooms</div>
                <div className="flex items-center gap-3 text-lg font-semibold"><Bath size={28} className="text-muted-foreground/70" /> {property.baths} Bathrooms</div>
              </div>
            </CardContent>
          </Card>

          {/* Roommate / Rent-Split Mode Card */}
          {property.isRoommateAllowed && (
            <Card className="border border-emerald-200 shadow-md bg-gradient-to-br from-emerald-50/70 via-white to-green-50/40 rounded-2xl overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-emerald-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Rent Sharing / Roommates Welcome 🤝
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Ideal for students, batchmates, and young professionals sharing rent.</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-extrabold px-3 py-1 text-xs rounded-full shadow-xs">
                    Split Up To {property.roommatesCount || 1} Ways
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Per Person Share</p>
                    <p className="text-2xl font-black text-emerald-700">
                      PKR {Math.round(property.price / (property.roommatesCount || 1)).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Property Rent</p>
                    <p className="text-2xl font-bold text-slate-800">
                      PKR {property.price.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-6 tracking-tight text-gray-900 border-b pb-4">Overview</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-lg">{property.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Price & Contact Card */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-6">
          <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl ring-1 ring-black/5">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1.5">Asking Price</p>
              <h2 className="text-3xl md:text-4xl font-black text-primary">PKR {property.price.toLocaleString()}</h2>
            </div>
            
            <CardContent className="p-6">
              {/* Owner Info */}
              <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-black/5">
                  <AvatarFallback className="text-lg font-bold bg-gray-100 text-gray-700">
                    {property.owner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Listed By</p>
                    {property.owner.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <BadgeCheck size={12} className="text-emerald-600" /> Verified Renter 🛡️
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-lg text-gray-900 leading-none">{property.owner.name}</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-4">
                {property.lat && property.lng ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full font-bold text-xs h-11 border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 rounded-xl"
                    onClick={() => {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`, '_blank');
                    }}
                  >
                    <Navigation size={15} className="text-indigo-600" /> 🗺️ Get Directions (Google Maps)
                  </Button>
                ) : null}

                {isOwner ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Owner Actions</span>
                    
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full font-bold text-sm h-12 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 rounded-xl shadow-xs"
                      onClick={() => router.push(`/properties/${property.id}/edit`)}
                    >
                      <Pencil size={16} className="text-emerald-600" /> Edit Listing Details
                    </Button>

                    {property.status === 'AVAILABLE' ? (
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="w-full font-bold text-sm h-12 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl shadow-xs"
                        onClick={() => handleStatusChange(property.type === 'RENT' ? 'RENTED' : 'SOLD')}
                      >
                        Mark as {property.type === 'RENT' ? 'Rented Out' : 'Sold Out'}
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        className="w-full font-bold text-sm h-12 rounded-xl shadow-xs"
                        onClick={() => handleStatusChange('AVAILABLE')}
                      >
                        Mark as Available
                      </Button>
                    )}

                    <Button 
                      size="lg" 
                      variant="ghost" 
                      className="w-full font-bold text-xs h-10 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2 rounded-xl mt-1"
                      onClick={handleDeleteProperty}
                    >
                      <Trash2 size={15} /> Delete Listing
                    </Button>
                  </div>
                ) : property.status === 'AVAILABLE' ? (
                  <Button 
                    size="lg"
                    onClick={handleMessageOwner}
                    disabled={messaging}
                    className="w-full font-bold text-base h-14 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {messaging ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <MessageCircle className="mr-2 h-5 w-5" />}
                    {messaging ? "Starting chat..." : "Message Owner"}
                  </Button>
                ) : (
                  <div className="w-full text-center p-4 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-red-700 font-bold text-lg mb-1">Unavailable</p>
                    <p className="text-sm text-red-600/80 leading-snug">This property has been marked as {property.status.toLowerCase()} by the owner.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
