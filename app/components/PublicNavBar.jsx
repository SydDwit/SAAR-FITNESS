"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/Icon";

export default function PublicNavBar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if the user is on a protected page
  const isProtectedPage = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");
  
  // Don't show public navbar on protected pages
  if (isProtectedPage) return null;

  // All authenticated users go to admin dashboard
  const dashboardLink = "/admin";
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-900">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" className="h-10 w-10 rounded-full" alt="logo" />
            <span className="font-bold text-xl text-white">SAAR FITNESS</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-white hover:bg-zinc-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/#home" 
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/#about" 
              className="text-zinc-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link 
              href="/#contact" 
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
            
            {session ? (
              <Link 
                href={dashboardLink}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                <span>Dashboard</span>
                <Icon name="arrow-right" className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <Link 
              href="/#home" 
              className="block py-2 text-zinc-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/#about" 
              className="block py-2 text-zinc-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/#contact" 
              className="block py-2 text-zinc-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {session ? (
              <Link 
                href={dashboardLink}
                className="block py-2 text-rose-500 font-medium hover:text-rose-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link 
                href="/login"
                className="block py-2 text-rose-500 font-medium hover:text-rose-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login →
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
