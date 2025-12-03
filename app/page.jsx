"use client";
import Link from "next/link";
import { useRef } from "react";

export default function Home() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white">
      {/* Home Section */}
      <section 
        ref={homeRef} 
        className="min-h-screen flex items-center justify-center pt-16" 
        id="home"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white">Your Life Is Your Making</h1>
            <p className="mb-8 text-lg text-slate-300">Simple membership management for trainers. Track subscriptions. Capture member photos. Search and sort. Admin controls for trainers and members.</p>
            <div className="flex gap-4">
              <Link href="/dashboard" className="btn bg-rose-600 text-white shadow-lg shadow-rose-700/30">Enter</Link>
              <Link href="#" className="btn bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-900/20">Docs</Link>
            </div>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full border-4 border-rose-500 shadow-lg shadow-rose-700/30" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={aboutRef} 
        className="min-h-screen flex items-center justify-center bg-zinc-900" 
        id="about"
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">About Us</h2>
            <p className="text-xl text-slate-300 mb-8">SAAR FITNESS is dedicated to providing a simple and effective solution for gym membership management. Our platform helps trainers and admins track subscriptions, manage member data, and streamline operations for a better fitness experience.</p>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-700/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Member Management</h3>
                <p className="text-slate-400">Easily manage member profiles, photos, and subscription details.</p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-700/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Subscription Tracking</h3>
                <p className="text-slate-400">Track subscription periods, renewals, and payment status.</p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-700/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-slate-400">Track member statistics, attendance, and business performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={contactRef} 
        className="min-h-screen flex items-center justify-center bg-black" 
        id="contact"
      >
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Contact Us</h2>
              <p className="text-xl text-slate-300">Have questions or need support? Reach out to us below.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-8">
                <h3 className="text-2xl font-semibold mb-4">Get In Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <a href="mailto:info@saarfitness.com" className="text-slate-300 hover:text-rose-500">info@saarfitness.com</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <span className="text-slate-300">+91-9876543210</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-slate-300">123 Fitness Street, Gym City</span>
                  </div>
                </div>
              </div>
              
              <div className="card p-8">
                <h3 className="text-2xl font-semibold mb-4">Connect With Us</h3>
                <p className="text-slate-400 mb-6">Follow us on social media for updates and fitness tips.</p>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                    <span className="text-lg font-bold">f</span>
                  </a>
                  <a href="#" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                    <span className="text-lg font-bold">in</span>
                  </a>
                  <a href="#" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                    <span className="text-lg font-bold">ig</span>
                  </a>
                  <a href="#" className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors">
                    <span className="text-lg font-bold">tw</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-zinc-500 border-t border-zinc-900">
        © 2025 SAAR FITNESS
      </footer>
    </div>
  );
}
