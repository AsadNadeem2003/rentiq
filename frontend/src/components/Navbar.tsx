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
    <nav className="h-16 border-b border-gray-100 bg-white flex items-center px-6 justify-between shadow-xs sticky top-0 z-50">
      <Link href="/feed" className="flex items-center gap-2 text-2xl font-extrabold text-emerald-700 tracking-tight">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white text-lg font-black shadow-xs">
          R
        </span>
        Rentiq
      </Link>
      
      <div className="flex items-center gap-5 text-sm font-semibold">
        <Link href="/feed" className="text-gray-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50/60">
          Feed
        </Link>
        {isAuthenticated ? (
          <>
            <Link href="/properties/new">
              <Button size="sm" className="hidden md:flex gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-lg px-4 h-9">
                <Plus size={18} strokeWidth={2.5} /> Post Listing
              </Button>
            </Link>
            
            <Link href="/inbox" onClick={clearUnread} className="relative">
              <Button size="sm" variant="outline" className="hidden md:flex gap-2 font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-9">
                <MessageCircle size={16} /> Inbox
              </Button>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 hidden md:flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md animate-in zoom-in-50 duration-200">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-emerald-500 rounded-full relative cursor-pointer">
                  <Avatar className="h-9 w-9 bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <AvatarFallback className="text-emerald-700 font-bold"><User size={18} /></AvatarFallback>
                  </Avatar>
                  {/* Mobile unread badge on avatar */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 md:hidden flex items-center justify-center min-w-[18px] h-[18px] px-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl shadow-lg border-gray-100">
                <DropdownMenuItem>
                  <Link href="/dashboard" className="cursor-pointer w-full font-medium py-1.5 px-2">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/inbox" onClick={clearUnread} className="cursor-pointer md:hidden flex justify-between items-center w-full font-medium py-1.5 px-2">
                    Inbox
                    {unreadCount > 0 && (
                      <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/properties/new" className="cursor-pointer md:hidden w-full font-medium py-1.5 px-2">Post Listing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium py-1.5 px-2">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-black transition-colors font-semibold px-3 py-1.5">
              Log in
            </Link>
            <Link href="/signup">
              <Button className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-lg px-4 h-9">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
