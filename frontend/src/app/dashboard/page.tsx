"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { token, user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [propsRes, convRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/properties?ownerId=${user?.sub}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProperties(propsRes.data.data || []);
        setConversations(convRes.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub) {
      fetchData();
    }
  }, [isAuthenticated, router, token, user?.sub]);

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* My Listings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Listings</h2>
            <Link href="/properties/new">
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add New</Button>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-4">
            {properties.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <p>You haven't listed any properties yet.</p>
              </div>
            ) : (
              properties.map(property => (
                <div key={property.id} className="flex flex-col sm:flex-row items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Link href={`/properties/${property.id}`} className="flex-1 flex items-center gap-4 min-w-0 w-full">
                    <img 
                      src={property.mediaUrls?.[0] || "https://placehold.co/100x100?text=No+Image"} 
                      alt={property.title} 
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                        {property.status !== 'AVAILABLE' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 whitespace-nowrap">
                            {property.status}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">PKR {property.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{property.area ? `${property.area}, ${property.city}` : property.city} • {property.type}</p>
                    </div>
                  </Link>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    {property.status === 'AVAILABLE' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full sm:w-auto text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          handleStatusChange(property.id, property.type === 'RENT' ? 'RENTED' : 'SOLD');
                        }}
                      >
                        Mark {property.type === 'RENT' ? 'Rented' : 'Sold'}
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="w-full sm:w-auto text-xs text-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleStatusChange(property.id, 'AVAILABLE');
                        }}
                      >
                        Mark Available
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Conversations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">My Conversations</h2>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-4">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <p>No active messages.</p>
              </div>
            ) : (
              conversations.map(conv => {
                const isOwner = conv.ownerId === user?.sub;
                const otherParticipant = isOwner ? conv.buyer : conv.owner;
                return (
                  <Link href={`/chat/${conv.id}`} key={conv.id}>
                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">Chat with {otherParticipant?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          Re: {conv.property?.title || 'Unknown Property'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
