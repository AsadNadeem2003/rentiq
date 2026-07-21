"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function InboxPage() {
  const { token, user, isAuthenticated } = useAuth();
  const { clearUnread } = useSocket();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Clear unread badge when user opens inbox
    clearUnread();

    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data || []);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.sub) {
      fetchConversations();
    }
  }, [isAuthenticated, router, token, user?.sub]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 mb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inbox</h1>
        <p className="text-gray-500 mt-2">Manage your property inquiries and conversations.</p>
      </div>

      <Card className="border-0 shadow-lg bg-white overflow-hidden rounded-xl">
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <MessageCircle size={48} className="text-primary/60" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 max-w-md">
                When you contact property owners or someone is interested in your listings, the conversations will appear here.
              </p>
              <Link href="/feed" className="mt-8 text-primary font-semibold hover:underline">
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => {
                const isOwner = conv.ownerId === user?.sub;
                const otherParticipant = isOwner ? conv.buyer : conv.owner;
                const latestMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0].text : "No messages yet";

                return (
                  <Link href={`/chat/${conv.id}`} key={conv.id} className="block hover:bg-gray-50 transition-colors">
                    <div className="p-4 md:p-6 flex items-start gap-4 md:gap-6">
                      <Avatar className="h-12 w-12 border shadow-sm shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {otherParticipant?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {otherParticipant?.name || "Unknown User"}
                          </h3>
                          <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-4">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-sm font-semibold text-primary mb-1 truncate">
                          Re: {conv.property?.title || "Unknown Property"}
                        </p>
                        
                        <p className="text-sm text-gray-500 truncate pr-8">
                          {latestMessage}
                        </p>
                      </div>
                      
                      <div className="hidden md:flex h-full items-center pl-4 text-gray-300">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
