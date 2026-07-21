"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Notification {
  type: string;
  conversationId: string;
  senderName: string;
  propertyTitle: string;
  text: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  clearUnread: () => void;
  setActiveConversation: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  unreadCount: 0,
  clearUnread: () => {},
  setActiveConversation: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const activeConversationRef = useRef<string | null>(null);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const setActiveConversation = useCallback((id: string | null) => {
    activeConversationRef.current = id;
  }, []);

  useEffect(() => {
    // Only connect when user is authenticated
    if (!isAuthenticated || !token) {
      // Disconnect if we were previously connected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Don't reconnect if we already have a socket
    if (socketRef.current?.connected) return;

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace("/api", "");

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketInstance.on("connect", () => {
      console.log("Global socket connected for notifications");
    });

    socketInstance.on("notification", (data: Notification) => {
      // Don't show notification if the user is already viewing this conversation
      if (activeConversationRef.current === data.conversationId) return;

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      const truncatedText = data.text.length > 60 ? data.text.slice(0, 60) + "..." : data.text;
      toast.message(`${data.senderName}`, {
        description: `${truncatedText}\n📍 ${data.propertyTitle}`,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            window.location.href = `/chat/${data.conversationId}`;
          },
        },
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Global socket disconnected");
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, clearUnread, setActiveConversation }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
