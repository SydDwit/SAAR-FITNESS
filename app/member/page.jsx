"use client";

import { useEffect, useState } from "react";
import MemberLayout from "../components/MemberLayout";

export default function MemberDashboardPage() {
  const [memberData, setMemberData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data immediately on mount - session is handled by MemberLayout
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // Fetch member profile
      const profileRes = await fetch("/api/member/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setMemberData(profileData);
      }
      
      // Fetch recent attendance
      const attendanceRes = await fetch("/api/member/attendance?limit=5");
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData.attendance || []);
      }
      
      // Fetch recent payments
      const paymentsRes = await fetch("/api/member/payments?limit=5");
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!memberData?.endDate) return 0;
    const end = new Date(memberData.endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "due":
      case "pending":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {memberData?.name || "Member"}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your fitness overview</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Membership Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Membership</h3>
            <span className="text-2xl">🎫</span>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                memberData?.status
              )}`}
            >
              {memberData?.status?.toUpperCase() || "N/A"}
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {getDaysRemaining()} days
            </p>
            <p className="text-xs text-gray-500">remaining</p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Payment</h3>
            <span className="text-2xl">💳</span>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                memberData?.paymentStatus
              )}`}
            >
              {memberData?.paymentStatus?.toUpperCase() || "N/A"}
            </span>
            <p className="text-sm text-gray-600 mt-3">
              Last payment: {payments[0] ? new Date(payments[0].paymentDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        {/* Attendance This Month */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
            <p className="text-xs text-gray-500">check-ins</p>
          </div>
        </div>

        {/* Plan Type */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Plan</h3>
            <span className="text-2xl">💪</span>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold text-gray-900">
              {memberData?.planType || "Standard"}
            </p>
            <p className="text-xs text-gray-500">
              {memberData?.subscriptionMonths || 1} month(s)
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Attendance
          </h2>
          {attendance.length > 0 ? (
            <div className="space-y-3">
              {attendance.map((record, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.checkInTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-green-600 text-sm">✓ Checked in</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              No attendance records yet
            </p>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Payments
          </h2>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{payment.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              No payment records yet
            </p>
          )}
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Age</span>
              <span className="text-sm font-medium text-gray-900">
                {memberData?.age || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Gender</span>
              <span className="text-sm font-medium text-gray-900">
                {memberData?.gender || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Height</span>
              <span className="text-sm font-medium text-gray-900">
                {memberData?.heightCm ? `${memberData.heightCm} cm` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weight</span>
              <span className="text-sm font-medium text-gray-900">
                {memberData?.weightKg ? `${memberData.weightKg} kg` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">BMI</span>
              <span className="text-sm font-medium text-gray-900">
                {memberData?.bmi ? memberData.bmi.toFixed(1) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Trainer Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Trainer
          </h2>
          {memberData?.assignedTrainerId ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">👨‍💼</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Trainer Assigned</p>
              <p className="text-xs text-gray-500 mt-1">Contact staff for details</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              No trainer assigned yet
            </p>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
