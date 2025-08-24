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

    const res = await fetch("/api/members", { method: "POST", body: fd });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else alert(data.error || "Failed");
  }

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Add Member</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Age</label>
          <input
            className="input"
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            className="select"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="label">Plan Type</label>
          <select
            className="select"
            value={form.planType}
            onChange={(e) => setForm({ ...form, planType: e.target.value })}
          >
            <option value="General">General</option>
            <option value="Personal">Personal</option>
            <option value="Weight Loss">Weight Loss</option>
          </select>
        </div>

        <div>
          <label className="label">Height (ft)</label>
          <input
            className="input"
            type="number"
            value={form.heightFt}
            onChange={(e) => setForm({ ...form, heightFt: e.target.value })}
            placeholder="e.g., 5"
          />
        </div>

        <div>
          <label className="label">Height (in)</label>
          <input
            className="input"
            type="number"
            value={form.heightIn}
            onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
            placeholder="e.g., 7"
          />
        </div>

        <div>
          <label className="label">Weight (kg)</label>
          <input
            className="input"
            type="number"
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
          />
        </div>

        <div>
          <label className="label">BMI</label>
          <input className="input" value={bmi ? bmi.toFixed(1) : ""} readOnly />
        </div>

        <div>
          <label className="label">Subscription</label>
          <select
            className="select"
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
          <label className="label">Start Date</label>
          <input
            className="input"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="label">Upload Photo</label>
          <input
            className="input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <p className="text-xs text-slate-400">Selected: {file.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="label">Or Capture</label>
          <div className="space-y-2">
            {!streaming && (
              <button
                type="button"
                className="badge"
                onClick={startCamera}
              >
                Start Camera
              </button>
            )}
            {streaming && (
              <button
                type="button"
                className="badge text-red-300 border-red-500"
                onClick={closeCamera}
              >
                Close Camera
              </button>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-xl border border-slate-700"
            />
            <canvas ref={canvasRef} className="hidden" />
            <button type="button" className="btn" onClick={capture}>
              Capture Snapshot
            </button>
          </div>
        </div>
      </div>

      <button className="btn">Save Member</button>
    </form>
  );
}
