"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    
    if (session?.user) {
      // Redirect authenticated users to their dashboard
      const role = session.user.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "staff") {
        router.push("/dashboard");
      } else if (role === "member") {
        router.push("/member");
      } else {
        router.push("/login");
      }
    } else {
      // Redirect unauthenticated users to login
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
        <p className="mt-4 text-zinc-300">Redirecting...</p>
      </div>
    </div>
  );
}

