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
    <PageContainer className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Add New Member</h1>
            <p className="text-zinc-400">Fill in the member details below</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/members")}
            className="btn bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Icon name="arrow-left" className="w-4 h-4" />
            Back to Members
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-3 border-b border-zinc-800">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Name *</label>
                <input
                  className="input w-full"
                  required
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Age</label>
                <input
                  className="input w-full"
                  type="number"
                  placeholder="Age in years"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Gender</label>
                <select
                  className="select w-full"
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
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-3 border-b border-zinc-800">
              Physical Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Height (ft)</label>
                <input
                  className="input w-full"
                  type="number"
                  step="0.1"
                  value={form.heightFt}
                  onChange={(e) => setForm({ ...form, heightFt: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Height (in)</label>
                <input
                  className="input w-full"
                  type="number"
                  step="0.1"
                  value={form.heightIn}
                  onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
                  placeholder="e.g., 7"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Weight (kg)</label>
                <input
                  className="input w-full"
                  type="number"
                  step="0.1"
                  placeholder="Weight in kg"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">BMI</label>
                <input 
                  className="input w-full bg-zinc-900/50 cursor-not-allowed" 
                  value={bmi ? bmi.toFixed(1) : ""} 
                  placeholder="Auto-calculated"
                  readOnly 
                />
              </div>
            </div>
          </div>

          {/* Membership Details Section */}
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-3 border-b border-zinc-800">
              Membership Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Plan Type</label>
                <select
                  className="select w-full"
                  value={form.planType}
                  onChange={(e) => setForm({ ...form, planType: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Personal">Personal</option>
                  <option value="Weight Loss">Weight Loss</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Subscription Duration</label>
                <select
                  className="select w-full"
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

              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm font-medium">Start Date</label>
                <input
                  className="input w-full"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Member Photo Section */}
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-6 pb-3 border-b border-zinc-800">
              Member Photo
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Photo Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm font-medium">Upload Photo</label>
                  <input
                    className="input w-full cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-700 file:cursor-pointer"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500 rounded-lg">
                      <Icon name="check-circle" className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-sm text-emerald-400 truncate">{file.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Capture Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-zinc-400 text-sm font-medium">Or Capture Photo</label>
                  <div className="space-y-3">
                    {!streaming ? (
                      <button
                        type="button"
                        className="btn bg-zinc-800 hover:bg-zinc-700 w-full flex items-center justify-center gap-2 py-3"
                        onClick={startCamera}
                      >
                        <Icon name="camera" className="w-4 h-4" />
                        Start Camera
                      </button>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="rounded-lg border-2 border-zinc-700 w-full aspect-video object-cover bg-black"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            type="button" 
                            className="btn bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-2 py-3" 
                            onClick={capture}
                          >
                            <Icon name="camera" className="w-4 h-4" />
                            Capture
                          </button>
                          <button
                            type="button"
                            className="btn bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center gap-2 py-3"
                            onClick={closeCamera}
                          >
                            <Icon name="x" className="w-4 h-4" />
                            Close
                          </button>
                        </div>
                      </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/members")}
              className="btn bg-zinc-800 hover:bg-zinc-700 px-8 py-3 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="btn bg-rose-600 hover:bg-rose-700 px-8 py-3 shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2 order-1 sm:order-2"
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
