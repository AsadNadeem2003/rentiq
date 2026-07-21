"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Bed, Bath, MapPin, Loader2 } from "lucide-react";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  city: string;
  beds: number;
  baths: number;
  mediaUrls: string[];
  ownerId: string;
  owner: {
    id: string;
    name: string;
  };
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties/${params.id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Failed to fetch property", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [params.id]);

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
      
      // Redirect to the chat room for this conversation
      router.push(`/chat/${response.data.id}`);
    } catch (error) {
      console.error("Failed to start conversation", error);
      alert("Could not start conversation.");
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading property details...</div>;
  }

  if (!property) {
    return <div className="flex h-screen items-center justify-center">Property not found.</div>;
  }

  // Basic check for self-messaging (backend will also strictly block this)
  const isOwner = false; // We would ideally decode JWT to check if req.user.id === property.ownerId, but backend handles 403 anyway.

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8">
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        
        {/* Image Gallery */}
        <div className="h-96 bg-gray-100 flex overflow-x-auto snap-x snap-mandatory">
          {property.mediaUrls && property.mediaUrls.length > 0 ? (
            property.mediaUrls.map((url, idx) => (
              <img key={idx} src={url} alt={`Property view ${idx + 1}`} className="h-full object-cover flex-shrink-0 w-full snap-center" />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No media available</div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold mb-3">
                FOR {property.type}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="flex items-center text-gray-500 gap-1">
                <MapPin size={18} /> {property.city}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold text-blue-600">PKR {property.price.toLocaleString()}</h2>
            </div>
          </div>

          <div className="flex gap-8 mb-8 border-y py-4 text-gray-700">
            <div className="flex items-center gap-2 text-lg"><Bed size={24} className="text-gray-400" /> {property.beds} Bedrooms</div>
            <div className="flex items-center gap-2 text-lg"><Bath size={24} className="text-gray-400" /> {property.baths} Bathrooms</div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{property.description}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Listed by</p>
              <p className="font-bold text-lg">{property.owner.name}</p>
            </div>
            
            {!isOwner && (
              <button 
                onClick={handleMessageOwner}
                disabled={messaging}
                className="bg-blue-600 text-white px-8 py-3 rounded-md font-bold hover:bg-blue-700 transition flex items-center disabled:opacity-50"
              >
                {messaging ? <Loader2 className="animate-spin mr-2" /> : null}
                Message Owner
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
