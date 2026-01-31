"use client";

import { useEffect, useState } from "react";
import MemberLayout from "../components/MemberLayout";

export default function MembershipPage() {
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch membership immediately
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      const res = await fetch("/api/member/membership");
      if (res.ok) {
        const data = await res.json();
        setMembershipData(data);
      }
    } catch (error) {
      console.error("Error fetching membership:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "text-green-600 bg-green-50 border-green-200",
      expired: "text-red-600 bg-red-50 border-red-200",
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
    };
    return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
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

  const isExpired = membershipData?.isExpired;
  const daysRemaining = membershipData?.daysRemaining || 0;

  return (
    <MemberLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Details</h1>
        <p className="text-gray-600 mb-8">View your subscription information</p>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {membershipData?.planType || "No Plan"}
                </h2>
                <p className="text-indigo-100">
                  {membershipData?.name}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full border-2 font-semibold ${
                  isExpired
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-green-100 text-green-700 border-green-300"
                }`}
              >
                {membershipData?.subscriptionStatus?.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Start Date
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(membershipData?.subscriptionStartDate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  End Date
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(membershipData?.subscriptionEndDate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Days Remaining
                </label>
                <p
                  className={`text-3xl font-bold ${
                    daysRemaining <= 7 && !isExpired
                      ? "text-yellow-600"
                      : daysRemaining <= 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {daysRemaining > 0 ? daysRemaining : 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Fee Amount
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{membershipData?.feeAmount?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Membership Expired
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Your membership has expired. Please contact the gym staff to renew your subscription.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isExpired && daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Membership Expiring Soon
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your membership will expire in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}. Consider renewing soon to avoid interruption.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <p className="text-gray-600 mb-4">
            For membership renewal or inquiries, please contact the gym staff during operating hours or visit the front desk.
          </p>
          <div className="bg-gray-50 rounded-md p-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <svg
                  className="h-5 w-5 text-gray-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Phone: Contact gym reception</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <svg
                  className="h-5 w-5 text-gray-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Email: {membershipData?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
