"use client";

import { useEffect, useState } from "react";
import MemberLayout from "../components/MemberLayout";

export default function ProfilePage() {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ weightKg: "", heightCm: "" });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fetch profile immediately on mount
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/member/profile");
      if (res.ok) {
        const data = await res.json();
        setMemberData(data);
        setFormData({
          weightKg: data.weightKg || "",
          heightCm: data.heightCm || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setMessage(null);

      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setMemberData(data.member);
        setEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error updating profile" });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600 mb-8">Manage your personal information</p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={memberData?.name || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={memberData?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={memberData?.age || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <input
                  type="text"
                  value={memberData?.gender || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={editing ? formData.heightCm : memberData?.heightCm || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: e.target.value })
                  }
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    editing
                      ? "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      : "bg-gray-50 text-gray-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={editing ? formData.weightKg : memberData?.weightKg || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: e.target.value })
                  }
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    editing
                      ? "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      : "bg-gray-50 text-gray-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BMI
                </label>
                <input
                  type="text"
                  value={memberData?.bmi ? memberData.bmi.toFixed(1) : ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type
                </label>
                <input
                  type="text"
                  value={memberData?.planType || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    weightKg: memberData?.weightKg || "",
                    heightCm: memberData?.heightCm || "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
