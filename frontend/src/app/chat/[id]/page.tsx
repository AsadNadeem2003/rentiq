"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Decode JWT to get user ID simply
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setMyUserId(payload.sub);
      } catch (e) {
        console.error("Failed to decode token");
      }
    }
  }, [token]);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.id}/messages?limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [params.id, token]);

  // Setup Socket.io
  useEffect(() => {
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      auth: { token },
      transports: ["websocket"], // force websocket
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat gateway");
      newSocket.emit("joinRoom", { conversationId: params.id });
    });

    newSocket.on("newMessage", (message: Message) => {
      setMessages((prev) => {
        // Prevent duplicate if optimistic update already added it
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [params.id, token]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;

    // We do an optimistic send over socket (which DB-writes first then broadcasts back)
    socket.emit("sendMessage", { conversationId: params.id, text });
    setText("");
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50 max-w-4xl mx-auto border-x shadow-sm">
      <div className="bg-white border-b p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Chat Thread</h1>
          <p className="text-xs text-gray-500 font-mono">ID: {params.id}</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-gray-400 mt-10">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === myUserId;
            return (
              <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border text-gray-800 rounded-tl-sm shadow-sm'}`}>
                  {!isMe && <p className="text-xs text-gray-400 font-bold mb-1">{msg.sender?.name || "User"}</p>}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 border rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <button 
            type="submit"
            disabled={!text.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
