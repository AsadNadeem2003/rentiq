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
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Plus, MessageCircle, Activity, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount, clearUnread } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-gray-100 bg-white shadow-xs sticky top-0 z-50">
      {/* Top bar */}
      <div className="h-16 flex items-center px-4 md:px-6 justify-between">
        <Link href="/feed" className="flex items-center gap-2 text-2xl font-extrabold text-emerald-700 tracking-tight">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white text-lg font-black shadow-xs">
            R
          </span>
          Rentiq
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2 md:gap-4 text-sm font-semibold">
          <Link href="/feed" className="text-gray-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50/60">
            Feed
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/my-activity" className="text-gray-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50/60 flex items-center gap-1.5">
                <Activity size={16} />
                My Activity
              </Link>

              <Link href="/settings" className="text-gray-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50/60 flex items-center gap-1.5">
                <Settings size={16} />
                Settings
              </Link>

              <Link href="/inbox" onClick={clearUnread} className="relative">
                <Button size="sm" variant="outline" className="gap-2 font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-9">
                  <MessageCircle size={16} /> Inbox
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md animate-in zoom-in-50 duration-200">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link href="/properties/new">
                <Button size="sm" className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs rounded-lg px-4 h-9">
                  <Plus size={18} strokeWidth={2.5} /> Post Listing
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-emerald-500 rounded-full cursor-pointer ml-1">
                  <Avatar className="h-9 w-9 bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <AvatarFallback className="text-emerald-700 font-bold"><User size={18} /></AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-xl shadow-lg border-gray-100">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-semibold py-2 px-3 flex items-center gap-2">
                    <LogOut size={16} />
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

        {/* Mobile right side — inbox badge + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          {isAuthenticated && (
            <Link href="/inbox" onClick={clearUnread} className="relative p-2 text-gray-600 hover:text-emerald-700">
              <MessageCircle size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-600 hover:text-emerald-700 transition-colors rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/feed"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            Feed
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/my-activity"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <Activity size={16} /> My Activity
              </Link>

              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <Settings size={16} /> Settings
              </Link>

              <Link
                href="/properties/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} /> Post Listing
              </Link>

              <div className="border-t border-gray-100 pt-2 mt-1">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <Button className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
