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

// Performance Bar Component
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

export default function AdminHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [expired, setExpired] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeSubscriptions: 0,
    totalTrainers: 0,
    newJoinsThisMonth: 0
  });

  async function loadMembers() {
    const res = await fetch(`/api/members?q=${encodeURIComponent(q)}&sort=${sort}`);
    const data = await res.json();
    const membersList = data.members || [];
    setMembers(membersList);
    
    // Update stats based on members data
    if (membersList.length > 0) {
      const active = membersList.filter(m => m.status === 'active').length;
      const newJoins = membersList.filter(m => {
        const joinDate = new Date(m.createdAt);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length;
      
      setStats(prev => ({
        ...prev,
        totalMembers: membersList.length,
        activeSubscriptions: active,
        newJoinsThisMonth: newJoins
      }));
    }
  }

  async function loadTrainers() {
    const res = await fetch('/api/staff');
    const data = await res.json();
    const trainersList = data.staff || [];
    setTrainers(trainersList);
    setStats(prev => ({ ...prev, totalTrainers: trainersList.length }));
  }
  
  async function checkExpired() {
    const r = await fetch("/api/subscriptions/check", { method: "POST" });
    const data = await r.json();
    setExpired(data.expired || []);
  }
  
  useEffect(() => { 
    loadMembers(); 
  }, [q, sort]);
  
  useEffect(() => { 
    loadTrainers();
    checkExpired(); 
  }, []);

  return (
    <PageContainer className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white pb-10">
      {/* Top Header */}
      <header className="p-6 pb-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome Back, {session?.user?.name || 'Admin'}! 👋
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
            title="Total Trainers" 
            value={stats.totalTrainers}
            change="{+2}" 
            icon="briefcase"
            iconBg="bg-purple-500/10"
            iconColor="text-purple-400"
            emoji="👔"
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
              <h2 className="text-lg font-semibold">Recent Members</h2>
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
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Payment</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {members.slice(0, 5).map((m) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.status === 'expired' 
                            ? 'bg-rose-900/20 text-rose-500'
                            : 'bg-green-900/20 text-green-500'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.paymentStatus === 'paid' 
                            ? 'bg-green-900/20 text-green-500'
                            : m.paymentStatus === 'partial'
                            ? 'bg-yellow-900/20 text-yellow-500'
                            : 'bg-rose-900/20 text-rose-500'
                        }`}>
                          {m.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => router.push('/admin/members')}
                          className="text-rose-400 hover:text-rose-300 text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-zinc-400">
                        No members found. Try a different search term.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
              <Link href="/admin/members" className="text-rose-400 hover:text-rose-300 text-sm font-medium">
                View All Members →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Expired */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/dashboard/new')}
                className="w-full bg-rose-600 hover:bg-rose-700 px-4 py-3 rounded-lg flex items-center gap-3 transition-all"
              >
                <Icon name="user-plus" className="w-4 h-4" />
                <span className="font-medium">Add New Member</span>
              </button>
              <button 
                onClick={() => router.push('/admin/members')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg flex items-center gap-3 transition-all"
              >
                <Icon name="users" className="w-4 h-4" />
                <span className="font-medium">View All Members</span>
              </button>
              <button 
                onClick={() => router.push('/admin/staff')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-lg flex items-center gap-3 transition-all"
              >
                <Icon name="briefcase" className="w-4 h-4" />
                <span className="font-medium">Manage Trainers</span>
              </button>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Weekly Activity</h2>
              <span className="bg-green-900/20 text-green-500 text-xs px-2.5 py-1 rounded-md font-medium">
                +15%
              </span>
            </div>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold">{stats.activeSubscriptions}</span>
              <p className="text-zinc-500 text-sm mt-1">Active Members</p>
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
          {expired.length > 0 && (
            <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 shadow-lg overflow-hidden">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Expired</h2>
                <div className="bg-rose-900/20 text-rose-500 text-xs px-2.5 py-1 rounded-md font-medium">
                  {expired.length} pending
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                {expired.slice(0, 3).map((m) => (
                  <div key={m._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{m.name}</p>
                      <span className="text-xs text-zinc-500">
                        Expired: {new Date(m.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="text-xs bg-rose-600/20 text-rose-500 px-3 py-1.5 rounded-md hover:bg-rose-600/30 transition-colors">
                      Renew
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
