"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Icon from "@/app/components/Icon";

export default function NavBar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  // Determine the correct dashboard link based on role
  const dashboardLink = session?.user?.role === "admin" ? "/admin" : "/dashboard";
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-900">
      <div className="container flex items-center gap-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" className="h-10 w-10 rounded-full" alt="logo" />
          <span className="font-bold text-xl">SAAR FITNESS</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/#home" className="nav-link">Home</Link>
          <Link href="/#about" className="nav-link">About</Link>
          <Link href="/#contact" className="nav-link">Contact</Link>
          
          {session ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="btn py-1 px-4 bg-rose-600 flex items-center gap-2"
              >
                {session.user.name || session.user.email.split('@')[0]}
                <Icon name="chevronDown" size="sm" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg py-1 z-50">
                  <Link 
                    href={dashboardLink}
                    className="block px-4 py-2 text-sm text-white hover:bg-zinc-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-800 border-t border-zinc-800"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn py-1 px-4 bg-rose-600">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
