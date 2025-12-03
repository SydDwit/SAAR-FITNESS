"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/app/components/Icon";
import PageContainer from "@/app/components/PageContainer";

// Stat Card Component
const StatCard = ({ title, value, change, icon, iconBg, iconColor, emoji }) => {
  return (
    <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800 shadow-lg hover:border-zinc-700 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className={`${iconBg} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
          <Icon name={icon} className={`${iconColor} w-5 h-5`} />
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div>
        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        {change && (
          <p className="text-xs font-medium flex items-center gap-1">
            {change.startsWith('+') ? (
              <>
                <span className="text-emerald-400">▲ {change}</span>
                <span className="text-zinc-500">vs last month</span>
              </>
            ) : (
              <>
                <span className="text-rose-400">▼ {change}</span>
                <span className="text-zinc-500">vs last month</span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

// Performance Chart Component
const PerformanceBar = ({ day, percentage, isHighlighted }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="h-24 w-8 bg-zinc-800 rounded-md relative">
        <div 
          className={`absolute bottom-0 w-full rounded-md ${isHighlighted ? 'bg-rose-500' : 'bg-zinc-600'}`}
          style={{ height: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-xs text-zinc-500 mt-2">{day}</span>
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");
  const [members, setMembers] = useState([]);
  const [expired, setExpired] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    newJoinsThisMonth: 0
  });

  async function load() {
    const res = await fetch(`/api/members?q=${encodeURIComponent(q)}&sort=${sort}`);
    const data = await res.json();
    setMembers(data.members || []);
    
    // Update stats based on members data
    if (data.members) {
      const active = data.members.filter(m => m.status === 'active').length;
      const newJoins = data.members.filter(m => {
        const joinDate = new Date(m.createdAt);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length;
      
      setStats({
        totalMembers: data.members.length,
        activeSubscriptions: active,
        pendingPayments: expired.length,
        newJoinsThisMonth: newJoins
      });
    }
  }
  
  async function checkExpired() {
    const r = await fetch("/api/subscriptions/check", { method: "POST" });
    const data = await r.json();
    setExpired(data.expired || []);
  }
  
  useEffect(() => { 
    load(); 
  }, [q, sort]);
  
  useEffect(() => { 
    checkExpired(); 
  }, []);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white pb-10">
      {/* Top Header */}
      <header className="p-6 pb-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome Back, {session?.user?.name || 'Trainer'}! 👋
            </h1>
            <p className="text-zinc-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
              <Icon name="download" className="w-4 h-4 text-zinc-400" />
              <span>Export</span>
            </button>
            <Link href="/dashboard/new" className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
              <Icon name="user-plus" className="w-4 h-4" />
              <span>New Member</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Members" 
            value={stats.totalMembers} 
            change={"+12%"} 
            icon="users" 
            iconBg="bg-rose-500/10"
            iconColor="text-rose-400"
            emoji="👥"
          />
          <StatCard 
            title="Active Subscriptions" 
            value={stats.activeSubscriptions} 
            change={"+8%"} 
            icon="check-circle"
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-400"
            emoji="✓"
          />
          <StatCard 
            title="Revenue This Month" 
            value={`₹${(stats.totalMembers * 2500).toLocaleString()}`}
            change={"+15%"} 
            icon="dollar"
            iconBg="bg-blue-500/10"
            iconColor="text-blue-400"
            emoji="💰"
          />
          <StatCard 
            title="Expired Memberships" 
            value={expired.length} 
            change={expired.length > 0 ? `-${expired.length}` : "+0"} 
            icon="alert-circle"
            iconBg="bg-amber-500/10"
            iconColor="text-amber-400"
            emoji="⚠️"
          />
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left Column - Members Table */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-lg font-semibold">Members</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    className="bg-zinc-800 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 w-full md:w-48 pl-8"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                  <Icon name="search" className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
                </div>
                <select 
                  className="bg-zinc-800 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  <option value="name">Sort: Name</option>
                  <option value="-createdAt">Sort: Newest</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Member</th>
                    <th className="px-6 py-3 text-left">Plan</th>
                    <th className="px-6 py-3 text-left">BMI</th>
                    <th className="px-6 py-3 text-left">Height/Weight</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Ends</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {members.map((m) => (
                    <tr key={m._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {m.photoUrl ? 
                            <div className="h-10 w-10 rounded-md overflow-hidden">
                              <img src={m.photoUrl} className="h-full w-full object-cover" alt={m.name}/>
                            </div> : 
                            <div className="bg-rose-600/20 text-rose-500 w-8 h-8 rounded-md flex items-center justify-center font-medium text-sm">
                              {m.name?.charAt(0)?.toUpperCase()}
                            </div>
                          }
                          <span className="ml-3 font-medium text-white">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md text-xs">
                          {m.planType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {m.bmi?.toFixed?.(1) || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {m.heightCm} cm / {m.weightKg} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.status === 'expired' 
                            ? 'bg-rose-900/20 text-rose-500'
                            : 'bg-green-900/20 text-green-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            m.status === 'expired' ? 'bg-rose-500' : 'bg-green-500'
                          }`}></span>
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {new Date(m.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-zinc-400 hover:text-white">
                          <Icon name="more-vertical" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-zinc-400">
                        No members found. Try a different search term or add a new member.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/30">
              <span className="text-sm text-zinc-500">Showing {members.length} {members.length === 1 ? 'member' : 'members'}</span>
              {members.length > 10 && (
                <div className="flex items-center space-x-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400">
                    <Icon name="chevron-left" className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-rose-600 text-white">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400">2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400">3</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400">
                    <Icon name="chevron-right" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Performance & Expired Subscriptions */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Performance</h2>
              <span className="bg-green-900/20 text-green-500 text-xs px-2.5 py-1 rounded-md font-medium">
                +15% this week
              </span>
            </div>
            <div className="flex justify-center">
              <div className="text-center mb-6">
                <span className="text-5xl font-bold">86%</span>
                <p className="text-zinc-500 text-sm">Attendance Rate</p>
              </div>
            </div>
            <div className="flex justify-between items-end pt-4 px-2">
              <PerformanceBar day="Mon" percentage={82} />
              <PerformanceBar day="Tue" percentage={65} />
              <PerformanceBar day="Wed" percentage={90} isHighlighted={true} />
              <PerformanceBar day="Thu" percentage={75} />
              <PerformanceBar day="Fri" percentage={85} />
            </div>
          </div>

          {/* Expired Subscriptions Card */}
          <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Expired Subscriptions</h2>
              <div className="bg-rose-900/20 text-rose-500 text-xs px-2.5 py-1 rounded-md font-medium">
                {expired.length} pending
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {expired.length > 0 ? (
                expired.slice(0, 4).map((m) => (
                  <div key={m._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{m.name}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-zinc-500">
                          Expired: {new Date(m.endDate).toLocaleDateString()}
                        </span>
                        <span className="mx-2 text-zinc-700">•</span>
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs">
                          {m.planType}
                        </span>
                      </div>
                    </div>
                    <button className="text-xs bg-rose-600/20 text-rose-500 px-3 py-1.5 rounded-md hover:bg-rose-600/30 transition-colors">
                      Renew
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-500">
                  <Icon name="check-circle" className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p>No expired subscriptions</p>
                </div>
              )}
            </div>
            
            {expired.length > 0 && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <button className="w-full py-2 text-sm text-rose-500 hover:text-rose-400 font-medium">
                  View All Expired Subscriptions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
