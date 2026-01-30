"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Only redirect if already authenticated as admin
  useEffect(() => {
    if (session && status === "authenticated" && session.user.role === "admin") {
      router.replace("/admin");
      // Do not redirect staff users - allow them to login as admin
    }
    // Staff users can stay on this page to log in as admin
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen grid md:grid-cols-2 gap-0">
      {/* Left side - Hero with Background Image */}
      <div 
        className="hidden md:block relative overflow-hidden bg-login-hero bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 z-10"></div>
        
        {/* Text Content */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-2xl">SAAR FITNESS</h1>
            <p className="text-lg text-gray-300 mt-4 drop-shadow-xl">Your Life Is Your Making</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Admin Login Form */}
      <div className="flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-rose-500">ADMIN ACCESS</h2>
            <p className="mt-2 text-slate-400">Please enter your administrator credentials</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="mail" className="text-rose-500 w-4 h-4" />
                </span>
                <input 
                  type="email"
                  name="email"
                  autoComplete="username" 
                  className="bg-zinc-900 border border-zinc-800 pl-16 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-indent" 
                  placeholder="Admin Email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  style={{ textIndent: "20px" }}
                />
              </div>
            
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" className="text-rose-500 w-4 h-4" />
                </span>
                <input 
                  type="password"
                  name="password"
                  autoComplete="current-password" 
                  className="bg-zinc-900 border border-zinc-800 pl-16 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-indent" 
                  placeholder="Admin Password"
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  style={{ textIndent: "20px" }}
                />
              </div>
            </div>

            <div>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-300 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              <button 
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors shadow-lg shadow-rose-900/30"
                disabled={loading}
                onClick={async ()=>{
                  setError("");
                  if (!email || !password) {
                    setError("Please enter both email and password");
                    return;
                  }
                  setLoading(true);
                  try {
                    console.log("Attempting admin login...");
                    const adminRes = await signIn("credentials", {
                      email,
                      password,
                      role: "admin", // Specify admin role
                      redirect: false,
                      callbackUrl: "/admin" // Explicitly set the callback URL
                    });
                    console.log("Admin login result:", adminRes);
                    
                    if (adminRes?.error) {
                      setError("Invalid administrator credentials");
                    } else {
                      // Force redirect to admin page
                      router.replace("/admin");
                    }
                  } catch (err) {
                    setError("An error occurred during sign in");
                    console.error(err);
                  }
                  setLoading(false);
                }}
              >
                {loading ? "Signing in..." : "ACCESS ADMIN PANEL"}
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">Use /api/seed to create a default admin if needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
