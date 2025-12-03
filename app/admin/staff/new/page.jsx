"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddNewTrainer() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Ensure only admins can access this page
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  async function submit(e) {
    e.preventDefault();

    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.ok) {
      router.push("/admin/staff");
    } else {
      alert(data.error || "Failed to add trainer");
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Add New Trainer</h1>
            <p className="text-zinc-400 text-sm">
              Fill in the trainer details below
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/staff")}
            className="btn bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-white font-medium rounded-lg shadow-lg transition-all"
          >
            Back to Trainers
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Trainer Information Section */}
          <div className="card p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trainer Information</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="label">Full Name <span className="text-rose-500">*</span></label>
                <input
                  className="input w-full"
                  required
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="label">Email Address</label>
                <input
                  className="input w-full"
                  type="email"
                  required
                  placeholder="trainer@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="label">Phone Number</label>
                <input
                  className="input w-full"
                  type="tel"
                  required
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn bg-rose-600 hover:bg-rose-700 py-3 px-8 shadow-lg shadow-rose-900/30 text-lg flex-1"
            >
              Add Trainer
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/staff")}
              className="btn bg-zinc-800 hover:bg-zinc-700 py-3 px-8 text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
