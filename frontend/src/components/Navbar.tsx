"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Plus, MessageCircle } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount, clearUnread } = useSocket();

  return (
    <nav className="h-16 border-b bg-white flex items-center px-6 justify-between shadow-sm sticky top-0 z-50">
      <Link href="/feed" className="text-2xl font-black text-primary tracking-tighter">
        Rentiq.
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/feed" className="text-gray-600 hover:text-black transition-colors">Feed</Link>
        {isAuthenticated ? (
          <>
            <Link href="/properties/new">
              <Button size="sm" className="hidden md:flex gap-2 font-semibold">
                <Plus size={16} /> Add Listing
              </Button>
            </Link>
            
            <Link href="/inbox" onClick={clearUnread} className="relative">
              <Button size="sm" variant="outline" className="hidden md:flex gap-2 font-semibold">
                <MessageCircle size={16} /> Inbox
              </Button>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 hidden md:flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold shadow-md animate-in zoom-in-50 duration-200">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-primary rounded-full relative">
                  <Avatar className="h-9 w-9 bg-primary/10">
                    <AvatarFallback className="text-primary font-bold"><User size={18} /></AvatarFallback>
                  </Avatar>
                  {/* Mobile unread badge on avatar */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:hidden flex items-center justify-center min-w-[18px] h-[18px] px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/inbox" onClick={clearUnread} className="cursor-pointer md:hidden flex justify-between items-center">
                    Inbox
                    {unreadCount > 0 && (
                      <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/properties/new" className="cursor-pointer md:hidden">Add Listing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-black transition-colors font-semibold">Log in</Link>
            <Link href="/signup">
              <Button className="font-semibold">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
