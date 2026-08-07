"use client";

import { useEffect, useState, useRef, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import { Send, Loader2, ArrowLeft, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  propertyId: string;
  property: {
    title: string;
    price: number;
    status?: string;
    ownerId: string;
    owner: { name: string; isVerified?: boolean };
  };
  buyer: { name: string; id: string; isVerified?: boolean };
  owner: { name: string; id: string; isVerified?: boolean };
}

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { token, isAuthenticated, user } = useAuth();
  const { setActiveConversation } = useSocket();
  const router = useRouter();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Tell SocketContext we're viewing this conversation (suppress notifications)
    setActiveConversation(id);

    const fetchChatData = async () => {
      try {
        const [convRes, msgsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setConversation(convRes.data);
        setMessages(msgsRes.data.data || []);
      } catch (error) {
        console.error("Failed to load chat", error);
        alert("Failed to load conversation");
        router.push("/my-activity");
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Initialize Socket.io
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:3001", {
      auth: { token },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to chat server");
      socketInstance.emit("joinRoom", { conversationId: id });
    });

    socketInstance.on("newMessage", (message: Message) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setSending(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setActiveConversation(null); // Re-enable notifications when leaving chat
    };
  }, [isAuthenticated, id, token, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || sending) return;

    const text = newMessage.trim();
    setNewMessage(""); // Optimistic UI clear
    setSending(true);

    try {
      // 1. Save to database via REST API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${id}/messages`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const savedMessage = response.data;
      
      // 2. Append to local state immediately
      setMessages((prev) => [...prev, savedMessage]);
      setSending(false);

      // 3. Broadcast to other users in the room
      // Since the REST API already saved it, we just need the gateway to broadcast it.
      // But the gateway's sendMessage ALSO saves to DB. 
      // Actually, we can just use the socket to emit the saved message, or use a new event.
      // For now, let's just let the gateway save it again? No, that would duplicate.
      // Let's modify the frontend to emit a new 'broadcastMessage' event or we just rely on REST.
      // Wait, if I just use socket.emit("sendMessage"), I don't need the REST call. 
      // Let's stick to socket.emit("sendMessage", { conversationId: id, text }) 
      // BUT if it fails silently, the user gets stuck.
      socket.emit("broadcastMessage", savedMessage);
      
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message. Please try again.");
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading chat...</div>;
  }

  if (!conversation || !user) return null;

  const isOwner = user.sub === conversation.property.ownerId;
  const otherPerson = isOwner ? conversation.buyer : conversation.owner;
  const otherPersonName = otherPerson?.name;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] p-4 flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg bg-white rounded-xl">
        
        {/* Chat Header */}
        <div className="min-h-[64px] md:h-20 border-b bg-gray-50/80 px-4 md:px-6 py-3 flex items-center justify-between gap-3 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/my-activity" className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
              <ArrowLeft size={22} />
            </Link>
            <Avatar className="h-9 w-9 md:h-10 md:w-10 border shadow-sm shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {otherPersonName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-base md:text-lg leading-tight truncate">{otherPersonName}</h2>
                {otherPerson?.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs shrink-0">
                    <BadgeCheck size={12} className="text-emerald-600" /> Verified 🛡️
                  </span>
                )}
              </div>
              <Link href={`/properties/${conversation.propertyId}`} className="text-xs md:text-sm text-primary hover:underline truncate max-w-[160px] sm:max-w-[220px] md:max-w-xs block font-medium">
                {conversation.property.title}
              </Link>
            </div>
          </div>
          <div className="hidden sm:block text-right shrink-0">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Asking Price</p>
            <p className="font-bold text-gray-900 text-sm md:text-base">PKR {conversation.property.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Avatar className="h-16 w-16 opacity-50"><AvatarFallback>?</AvatarFallback></Avatar>
              <p className="text-sm font-medium">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user.sub;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-white border text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 font-medium ${isMe ? "text-primary-foreground/70 text-right" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {conversation.property.status && conversation.property.status !== 'AVAILABLE' ? (
          <div className="p-4 bg-amber-50 border-t border-amber-200 text-center shrink-0">
            <p className="text-sm font-bold text-amber-800">
              Messaging is closed for this listing
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              This property has been marked as {conversation.property.status.toLowerCase()} by the owner.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-white border-t shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3 max-w-full relative">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-12 rounded-full pl-6 pr-14 bg-gray-50 border-gray-200 focus-visible:ring-primary shadow-inner"
                disabled={sending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending} 
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 rounded-full shadow-md"
              >
                <Send size={18} className="ml-0.5" />
              </Button>
            </form>
          </div>
        )}

      </Card>
    </div>
  );
}
