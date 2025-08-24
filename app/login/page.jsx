"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (session && status === "authenticated") {
      // Redirect based on role
      if (session.user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
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
      <div className="hidden md:block relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-zinc-900/30 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('/images/login.jpg')", 
            filter: "blur(1px)"
          }}>
        </div>
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
            <h2 className="text-2xl font-bold text-white">SIGN IN</h2>
            <p className="mt-2 text-slate-400">Please enter your credentials below to sign in</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="radio" name="role" checked={role==='staff'} onChange={()=>setRole('staff')} className="w-4 h-4 accent-rose-500" />
                  <span>Staff</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input type="radio" name="role" checked={role==='admin'} onChange={()=>setRole('admin')} className="w-4 h-4 accent-rose-500" />
                  <span>Admin</span>
                </label>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="mail" className="text-rose-500 w-5 h-5" />
                </span>
                <input 
                  type="email"
                  name="email"
                  autoComplete="username" 
                  className="bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
                  placeholder="Email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" className="text-rose-500 w-5 h-5" />
                </span>
                <input 
                  type="password"
                  name="password"
                  autoComplete="current-password" 
                  className="bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
                  placeholder="Password"
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
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
                    const res = await signIn("credentials", {
                      email,
                      password,
                      role,
                      redirect: false
                    });
                    
                    if (res?.error) {
                      setError("Invalid login credentials");
                    } else if (res?.url) {
                      // Redirect handled by the useEffect
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
            <p className="text-center text-slate-400 text-sm">Use /api/seed to create a default admin.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
