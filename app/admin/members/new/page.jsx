"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Icon from "@/app/components/Icon";
import PageContainer from "@/app/components/PageContainer";

export default function NewMemberAdmin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    planType: "General",
    heightFt: "",
    heightIn: "",
    weightKg: "",
    subscriptionMonths: "1",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [bmi, setBmi] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  // Recompute BMI whenever height or weight changes
  useEffect(() => {
    const ft = Number(form.heightFt || 0);
    const inch = Number(form.heightIn || 0);
    const hCm = ft > 0 || inch > 0 ? ft * 30.48 + inch * 2.54 : 0;
    const w = Number(form.weightKg || 0);
    if (hCm > 0 && w > 0) setBmi(w / ((hCm / 100) ** 2));
    else setBmi(0);
  }, [form.heightFt, form.heightIn, form.weightKg]);

  async function startCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraStream(null);
    }
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    if (videoRef.current) videoRef.current.srcObject = s;
    setCameraStream(s);
    setStreaming(true);
  }

  function closeCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks?.() || [];
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setStreaming(false);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setFile(f);
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const ft = Number(form.heightFt || 0);
      const inch = Number(form.heightIn || 0);
      const heightCm = ft > 0 || inch > 0 ? String(ft * 30.48 + inch * 2.54) : "";

      const formToSend = {
        ...form,
        heightCm,
      };
      delete formToSend.heightFt;
      delete formToSend.heightIn;

      const fd = new FormData();
      Object.entries(formToSend).forEach(([k, v]) => fd.append(k, v));
      fd.append("bmi", bmi ? String(bmi) : "");
      if (file) fd.append("photo", file);

      if (streaming) {
        closeCamera();
      }

      const res = await fetch("/api/members", { method: "POST", body: fd });
      const data = await res.json();
      
      if (data.ok) {
        router.push("/admin/members");
      } else {
        alert(data.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("An error occurred while adding the member");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Add New Member</h1>
            <p className="text-sm text-zinc-400">Fill in the member details below</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/members")}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            Back to Members
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Personal Information Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="user" className="w-5 h-5 text-purple-400" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Name *</label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  required
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Age</label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  type="number"
                  placeholder="Age in years"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Gender</label>
                <select
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Physical Details Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="briefcase" className="w-5 h-5 text-purple-400" />
              Physical Details
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Height (ft)</label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  type="number"
                  step="0.1"
                  value={form.heightFt}
                  onChange={(e) => setForm({ ...form, heightFt: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Height (in)</label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  type="number"
                  step="0.1"
                  value={form.heightIn}
                  onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
                  placeholder="e.g., 7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Weight (kg)</label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  type="number"
                  step="0.1"
                  placeholder="Weight in kg"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">BMI</label>
                <input 
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400 placeholder-zinc-500 cursor-not-allowed" 
                  value={bmi ? bmi.toFixed(1) : ""} 
                  placeholder="Auto-calculated"
                  readOnly 
                />
              </div>
            </div>
          </div>

          {/* Membership Details Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="calendar" className="w-5 h-5 text-purple-400" />
              Membership Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Plan Type</label>
                <select
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  value={form.planType}
                  onChange={(e) => setForm({ ...form, planType: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Personal">Personal</option>
                  <option value="Weight Loss">Weight Loss</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Subscription Duration</label>
                <select
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  value={form.subscriptionMonths}
                  onChange={(e) =>
                    setForm({ ...form, subscriptionMonths: e.target.value })
                  }
                >
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date</label>
                <input
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Member Photo Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Icon name="camera" className="w-5 h-5 text-purple-400" />
              Member Photo
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Photo Column */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Upload Photo</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                {file && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                    <Icon name="check-circle" className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-400 truncate">{file.name}</p>
                  </div>
                )}
              </div>

              {/* Camera Capture Column */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Or Capture Photo</label>
                {!streaming ? (
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={startCamera}
                  >
                    <Icon name="camera" className="w-5 h-5" />
                    Start Camera
                  </button>
                ) : (
                  <div className="space-y-3">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="rounded-lg border-2 border-zinc-700 w-full aspect-video object-cover bg-black"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2" 
                        onClick={capture}
                      >
                        <Icon name="camera" className="w-4 h-4" />
                        Capture
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        onClick={closeCamera}
                      >
                        <Icon name="xmark" className="w-4 h-4" />
                        Close
                      </button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => router.push("/admin/members")}
              className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg shadow-rose-900/30"
            >
              {loading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  Save Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
