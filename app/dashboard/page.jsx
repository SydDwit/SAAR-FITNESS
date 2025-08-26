"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/app/components/Icon";

export default function Dashboard() {
  const [q,setQ] = useState("");
  const [sort,setSort] = useState("name");
  const [members,setMembers] = useState([]);
  const [expired,setExpired] = useState([]);

  async function load() {
    const res = await fetch(`/api/members?q=${encodeURIComponent(q)}&sort=${sort}`);
    const data = await res.json();
    setMembers(data.members || []);
  }
  async function checkExpired() {
    const r = await fetch("/api/subscriptions/check", { method: "POST" });
    const data = await r.json();
    setExpired(data.expired || []);
  }
  useEffect(()=>{ load(); },[q,sort]);
  useEffect(()=>{ checkExpired(); },[]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Staff Dashboard</h1>
        <Link href="/dashboard/new" className="btn bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20">Add Member</Link>
      </div>

      {expired.length>0 && (
        <div className="card p-6 mb-8 shadow-lg border-l-4 border-l-rose-600">
          <div className="badge bg-rose-500/10 border-rose-500 text-rose-300 text-sm font-medium px-3 py-1.5">Expired Subscriptions</div>
          <ul className="mt-4 list-disc list-inside text-sm space-y-1 text-zinc-300">
            {expired.map(m => <li key={m._id}>{m.name} expired on {new Date(m.endDate).toLocaleDateString()}</li>)}
          </ul>
        </div>
      )}

      <div className="card p-6 shadow-xl">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex-1 relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" className="text-zinc-500 w-4 h-4" />
            </span>
            <input 
              className="input pl-16 placeholder-indent"
              name="search"
              autoComplete="off"
              placeholder="Search by name..." 
              value={q} 
              onChange={e=>setQ(e.target.value)}
              style={{ textIndent: "20px" }}
            />
          </div>
          <select className="select max-w-[180px]" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="-createdAt">Newest</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="table w-full">
            <thead className="bg-zinc-900">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-zinc-300">Photo</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Plan</th>
                <th className="px-4 py-3 font-medium text-zinc-300">BMI</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Height</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Weight</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {members.map((m, index) => (
                <tr key={m._id} className={`hover:bg-zinc-900/50 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/20' : ''}`}>
                  <td className="px-4 py-3">{m.photoUrl ? 
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-zinc-800">
                      <img src={m.photoUrl} className="h-full w-full object-cover" alt={m.name}/>
                    </div> : 
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-400 text-sm font-medium">{m.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  }</td>
                  <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{m.planType}</td>
                  <td className="px-4 py-3 text-zinc-300">{m.bmi?.toFixed?.(1) || '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{m.heightCm} cm</td>
                  <td className="px-4 py-3 text-zinc-300">{m.weightKg} kg</td>
                  <td className="px-4 py-3">
                    <span className={`badge px-3 py-1 ${
                      m.status === 'expired' 
                      ? 'bg-rose-500/10 border-rose-500 text-rose-300' 
                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{new Date(m.endDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-400">
                    No members found. Try a different search term or add a new member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {members.length > 0 && (
          <div className="mt-4 text-right text-sm text-zinc-500">
            Showing {members.length} {members.length === 1 ? 'member' : 'members'}
          </div>
        )}
      </div>
    </div>
  )
}
