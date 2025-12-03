"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Only redirect if authenticated as staff
  useEffect(() => {
    if (session && status === "authenticated" && session.user.role === "staff") {
      // Staff only goes to dashboard
      router.replace("/dashboard");
    }
    // Don't redirect if user is admin
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
      {/* Left side - Background Image with Brand */}
      <div className="hidden md:block relative overflow-hidden">
        {/* Dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/70 z-10"></div>
        
        {/* Background image div with our custom class */}
        <div className="absolute inset-0 login-bg"></div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white tracking-wider">SAAR FITNESS</h1>
            <p className="mt-2 text-slate-300 text-lg">Your Life Is Your Making</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">TRAINER SIGN IN</h2>
            <p className="mt-2 text-slate-400">Please enter your trainer credentials below</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="mail" className="text-rose-500 w-4 h-4" />
                </span>
                <input 
                  type="email"
                  name="email"
                  autoComplete="username" 
                  className="bg-zinc-900 border border-zinc-800 pl-16 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-indent" 
                  placeholder="Email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  style={{ textIndent: "20px" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" className="text-rose-500 w-4 h-4" />
                </span>
                <input 
                  type="password"
                  name="password"
                  autoComplete="current-password" 
                  className="bg-zinc-900 border border-zinc-800 pl-16 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-indent" 
                  placeholder="Password"
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  style={{ textIndent: "20px" }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button type="button" className="text-rose-500 hover:text-rose-400">Forgot Password?</button>
              </div>
            </div>

            <div>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-300 px-4 py-2 rounded-md mb-4">
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
                    console.log("Attempting staff login...");
                    const res = await signIn("credentials", {
                      email,
                      password,
                      role: "staff", // Specify staff role
                      redirect: false,
                      callbackUrl: "/dashboard" // Explicitly set the callback URL
                    });
                    
                    console.log("Staff login result:", res);
                    if (res?.error) {
                      setError("Invalid login credentials");
                    } else {
                      // Force redirect to staff dashboard regardless of user's previous role
                      router.push("/dashboard");
                    }
                  } catch (err) {
                    setError("An error occurred during sign in");
                    console.error(err);
                  }
                  setLoading(false);
                }}
              >
                {loading ? "Signing in..." : "SIGN IN"}
              </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">Use /api/seed to create a default admin.</p>
              <p className="text-slate-400 text-sm mt-2">Admin? <a href="/admin/login" className="text-rose-500 hover:text-rose-400 underline">Login here</a> instead.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
