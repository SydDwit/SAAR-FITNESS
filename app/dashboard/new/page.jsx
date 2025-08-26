"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMember() {
  const router = useRouter();
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

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
    // stop any old stream first
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
        
        // Close camera after successful capture
        closeCamera();
        
        // Show a temporary success message
        const captureButton = document.querySelector('button[type="button"].btn.bg-rose-500');
        if (captureButton) {
          const originalText = captureButton.textContent;
          captureButton.textContent = "✓ Photo Captured";
          captureButton.classList.add("bg-emerald-600");
          captureButton.classList.remove("bg-rose-500", "hover:bg-rose-600");
          
          setTimeout(() => {
            captureButton.textContent = originalText;
            captureButton.classList.remove("bg-emerald-600");
            captureButton.classList.add("bg-rose-500", "hover:bg-rose-600");
          }, 2000);
        }
      },
      "image/jpeg",
      0.92
    );
  }

  async function submit(e) {
    e.preventDefault();

    // convert height to cm for backend
    const ft = Number(form.heightFt || 0);
    const inch = Number(form.heightIn || 0);
    const heightCm =
      ft > 0 || inch > 0 ? String(ft * 30.48 + inch * 2.54) : "";

    const formToSend = {
      ...form,
      heightCm, // API expects heightCm; we keep ft/in only on client
    };
    delete formToSend.heightFt;
    delete formToSend.heightIn;

    const fd = new FormData();
    Object.entries(formToSend).forEach(([k, v]) => fd.append(k, v));
    fd.append("bmi", bmi ? String(bmi) : "");
    if (file) fd.append("photo", file);

    // Close camera if it's still open
    if (streaming) {
      closeCamera();
    }
    
    const res = await fetch("/api/members", { method: "POST", body: fd });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else alert(data.error || "Failed");
  }

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto card p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-white mb-2">Add Member</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="label">Name</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Age</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9z"/>
                <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7 7 0 0 0-3.273 1.064l-.489-.316a.5.5 0 1 0-.577.82l.11.084a7 7 0 0 0-1.98 5.757l-.5 2.925a.5.5 0 0 0 .4.6l2.437.49a7 7 0 0 0 6.57-1.195l.197-.197a7 7 0 0 0 1.15-10.376l.537-.79a.5.5 0 0 0-.83-.576l-.204.3A7 7 0 0 0 8 1.07V0zm3.915 11.076a6 6 0 1 1-.8-.807l.8.807z"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent"
              type="number"
              placeholder="Age in years"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Gender</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z"/>
                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2zm9.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
              </svg>
            </span>
            <select
              className="select pl-16"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              style={{ textIndent: "20px" }}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Plan Type</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            </span>
            <select
              className="select pl-16"
              value={form.planType}
              onChange={(e) => setForm({ ...form, planType: e.target.value })}
              style={{ textIndent: "20px" }}
            >
              <option value="General">General</option>
              <option value="Personal">Personal</option>
              <option value="Weight Loss">Weight Loss</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Height (ft)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M8 16a.5.5 0 0 1-.5-.5v-1.293l-.646.647a.5.5 0 0 1-.707-.708L7.5 12.793v-1.086l-.646.647a.5.5 0 0 1-.707-.708L7.5 10.293V8.866l-.646.647a.5.5 0 0 1-.707-.708L7.5 7.453v-1.09l-.646.647a.5.5 0 0 1-.707-.708L7.5 5.5v-4a.5.5 0 0 1 1 0v4l1.354-1.353a.5.5 0 0 1 .707.708L8.207 6.207v1.09l1.354-1.353a.5.5 0 0 1 .707.708L8.914 7.904v1.087l1.353-1.353a.5.5 0 0 1 .707.708L9.621 9.7v1.086l1.353-1.353a.5.5 0 0 1 .707.708L10.328 11.5v1.293l1.353-1.353a.5.5 0 0 1 .707.708L11.035 13.5H8.5v2.5a.5.5 0 0 1-.5.5"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent"
              type="number"
              value={form.heightFt}
              onChange={(e) => setForm({ ...form, heightFt: e.target.value })}
              placeholder="e.g., 5"
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Height (in)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M8 16a.5.5 0 0 1-.5-.5v-1.293l-.646.647a.5.5 0 0 1-.707-.708L7.5 12.793v-1.086l-.646.647a.5.5 0 0 1-.707-.708L7.5 10.293V8.866l-.646.647a.5.5 0 0 1-.707-.708L7.5 7.453v-1.09l-.646.647a.5.5 0 0 1-.707-.708L7.5 5.5v-4a.5.5 0 0 1 1 0v4l1.354-1.353a.5.5 0 0 1 .707.708L8.207 6.207v1.09l1.354-1.353a.5.5 0 0 1 .707.708L8.914 7.904v1.087l1.353-1.353a.5.5 0 0 1 .707.708L9.621 9.7v1.086l1.353-1.353a.5.5 0 0 1 .707.708L10.328 11.5v1.293l1.353-1.353a.5.5 0 0 1 .707.708L11.035 13.5H8.5v2.5a.5.5 0 0 1-.5.5"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent"
              type="number"
              value={form.heightIn}
              onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
              placeholder="e.g., 7"
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Weight (kg)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M3 2v4.586l1.354-1.353a.5.5 0 0 1 .708.707l-2.415 2.415a.5.5 0 0 1-.708 0l-2.415-2.415a.5.5 0 0 1 .708-.707L1.5 6.586V2a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5"/>
                <path d="M2.973 7.773a.5.5 0 1 1-.998-.054A4.98 4.98 0 0 1 2 7 5 5 0 1 1 7 2a4.98 4.98 0 0 1-.719.025.5.5 0 1 1-.054-.998A6 6 0 1 0 8 2a6 6 0 0 0-5.027 8.773"/>
                <path d="M10.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H11v1.5a.5.5 0 0 1-1 0V8H8.5a.5.5 0 0 1 0-1H10V5.5a.5.5 0 0 1 .5-.5"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent"
              type="number"
              placeholder="Weight in kg"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">BMI</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z"/>
              </svg>
            </span>
            <input 
              className="input pl-16 placeholder-indent" 
              value={bmi ? bmi.toFixed(1) : ""} 
              placeholder="Calculated BMI"
              readOnly 
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Subscription</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5z"/>
                <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm13 2v5H9.5v-1h-3v1h-5V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1m-1 9H2a1 1 0 0 1-1-1v-1h14z"/>
              </svg>
            </span>
            <select
              className="select pl-16"
              value={form.subscriptionMonths}
              onChange={(e) =>
                setForm({ ...form, subscriptionMonths: e.target.value })
              }
              style={{ textIndent: "20px" }}
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="label">Start Date</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              style={{ textIndent: "20px" }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="label">Upload Photo</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-zinc-500 w-4 h-4" viewBox="0 0 16 16">
                <path d="M6.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                <path d="M14 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM3 2v-.5h6.5V2H3m9 11H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5v3h3l.004 1H15v8a1 1 0 0 1-1 1zM6.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M13 8.5h-1v1h-1v-1h-1v-1h1v-1h1v1h1zM3 6.5h3.5v1H3zm0 2.5h5v1H3zm0 2.5h6v1H3z"/>
              </svg>
            </span>
            <input
              className="input pl-16 placeholder-indent cursor-pointer"
              type="file"
              accept="image/*"
              capture="environment"
              placeholder="Choose a file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ textIndent: "20px" }}
            />
          </div>
          {file && (
            <p className="text-xs flex items-center gap-2 text-emerald-400 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
              {file.name.startsWith("capture") ? "Photo captured successfully" : `Selected: ${file.name}`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="label">Or Capture</label>
          <div className="space-y-2">
            {!streaming && (
              <button
                type="button"
                className="badge bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 flex items-center gap-2"
                onClick={startCamera}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-rose-400" viewBox="0 0 16 16">
                  <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2z"/>
                </svg>
                Start Camera
              </button>
            )}
            {streaming && (
              <button
                type="button"
                className="badge bg-rose-900/30 hover:bg-rose-900/50 text-red-300 border-red-500 px-4 py-2 flex items-center gap-2"
                onClick={closeCamera}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-red-400" viewBox="0 0 16 16">
                  <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8"/>
                  <path d="M10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0"/>
                </svg>
                Close Camera
              </button>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-xl border border-slate-700 bg-zinc-950 shadow-md w-full"
            />
            <canvas ref={canvasRef} className="hidden" />
            {streaming && (
              <button 
                type="button" 
                className="btn bg-rose-500 hover:bg-rose-600 mt-4 w-full flex items-center justify-center gap-2" 
                onClick={capture}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                  <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                  <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"/>
                </svg>
                Capture Snapshot
              </button>
            )}
          </div>
        </div>
      </div>

      <button className="btn bg-rose-600 hover:bg-rose-700 py-3 px-8 mt-4 shadow-lg shadow-rose-900/30 text-lg">Save Member</button>
    </form>
  );
}
