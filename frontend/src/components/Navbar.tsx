"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="h-16 border-b bg-white flex items-center px-6 justify-between shadow-sm sticky top-0 z-50">
      <Link href="/feed" className="text-2xl font-black text-blue-600 tracking-tighter">
        Rentiq.
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/feed" className="text-gray-600 hover:text-black">Feed</Link>
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/properties/new" className="text-gray-600 hover:text-black">Add Listing</Link>
            <button onClick={logout} className="text-gray-600 hover:text-black">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-black">Login</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
