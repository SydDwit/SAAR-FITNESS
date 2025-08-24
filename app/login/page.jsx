"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  className="bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
                  placeholder="Email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  className="bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 rounded-md w-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
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
              <button 
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors shadow-lg shadow-rose-900/30"
                disabled={loading}
                onClick={async ()=>{
                  setLoading(true);
                  const res = await signIn("credentials",{ email,password,role, redirect:true, callbackUrl: role==='admin'?"/admin":"/dashboard"});
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
