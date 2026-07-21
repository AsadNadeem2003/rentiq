"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Bed, Bath, MapPin, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  mediaUrls: string[];
  ownerId: string;
  owner: {
    id: string;
    name: string;
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
    <div className="max-w-5xl mx-auto p-4 md:p-6 mt-8 mb-16">
      <Card className="rounded-xl shadow-lg border-0 overflow-hidden bg-white">
        
        {/* Image Gallery */}
        <div className="h-96 bg-gray-100 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar relative">
          {property.mediaUrls && property.mediaUrls.length > 0 ? (
            property.mediaUrls.map((url, idx) => (
              <img key={idx} src={url} alt={`Property view ${idx + 1}`} className="h-full object-cover flex-shrink-0 w-full snap-center" />
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

        {/* Details Section */}
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{property.title}</h1>
              <p className="flex items-center text-muted-foreground font-medium text-lg gap-1.5">
                <MapPin size={20} /> {property.area ? `${property.area}, ${property.city}` : property.city}
              </p>
            </div>
            <div className="md:text-right bg-primary/5 px-6 py-4 rounded-xl border border-primary/10">
              <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-1">Asking Price</p>
              <h2 className="text-3xl md:text-4xl font-black text-primary">PKR {property.price.toLocaleString()}</h2>
            </div>
          </div>

          <div className="flex gap-8 mb-10 border-y py-6 text-gray-700">
            <div className="flex items-center gap-3 text-lg font-semibold"><Bed size={28} className="text-muted-foreground" /> {property.beds} Bedrooms</div>
            <div className="flex items-center gap-3 text-lg font-semibold"><Bath size={28} className="text-muted-foreground" /> {property.baths} Bathrooms</div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4 tracking-tight">About this property</h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-lg">{property.description}</p>
          </div>

          <div className="bg-gray-50/80 p-6 md:p-8 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {property.owner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Listed by</p>
                <p className="font-bold text-xl">{property.owner.name}</p>
              </div>
            </div>
            
            {!isOwner && property.status === 'AVAILABLE' && (
              <Button 
                size="lg"
                onClick={handleMessageOwner}
                disabled={messaging}
                className="w-full md:w-auto font-bold text-base h-14 px-8 shadow-md"
              >
                {messaging ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <MessageCircle className="mr-2 h-5 w-5" />}
                {messaging ? "Starting chat..." : "Message Owner"}
              </Button>
            )}
            {!isOwner && property.status !== 'AVAILABLE' && (
              <div className="w-full md:w-auto text-center md:text-right">
                <p className="text-red-600 font-bold text-lg mb-1">This property is no longer available.</p>
                <p className="text-sm text-gray-500">It has been marked as {property.status.toLowerCase()} by the owner.</p>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
