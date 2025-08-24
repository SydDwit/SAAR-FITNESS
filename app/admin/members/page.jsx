"use client";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

export default function MembersAdmin(){
  const [list,setList] = useState([]);
  const [q,setQ] = useState("");
  async function load(){
    const r = await fetch(`/api/members?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setList(d.members||[]);
  }
  useEffect(()=>{ load(); },[q]);
  async function remove(id){
    if (!confirm("Delete member?")) return;
    await fetch(`/api/members?id=${id}`,{ method:"DELETE" });
    load();
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">All Members</h1>
        
        <div className="w-full md:w-64 relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" className="text-zinc-500 w-5 h-5" />
          </span>
          <input 
            className="input pl-9"
            name="search"
            autoComplete="off"
            placeholder="Search members..." 
            value={q} 
            onChange={e=>setQ(e.target.value)}
          />
        </div>
      </div>
      
      <div className="card p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-zinc-900">
              <tr className="text-left border-b border-zinc-800">
                <th className="px-4 py-3 font-medium text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Plan</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Ends</th>
                <th className="px-4 py-3 font-medium text-zinc-300"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-zinc-400">
                    {q ? "No members found matching your search" : "No members have been added yet"}
                  </td>
                </tr>
              ) : (
                list.map((m, index) => (
                  <tr key={m._id} className={`hover:bg-zinc-900/50 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/20' : ''}`}>
                    <td className="px-4 py-3 font-medium text-white">{m.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{m.planType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        m.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500' 
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{new Date(m.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="px-3 py-1 rounded-md bg-rose-600/10 border border-rose-500 text-rose-300 hover:bg-rose-600/20 transition-colors" 
                        onClick={()=>remove(m._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {list.length > 0 && (
          <div className="mt-4 text-right text-sm text-zinc-500">
            Showing {list.length} {list.length === 1 ? 'member' : 'members'}
          </div>
        )}
      </div>
    </div>
  )
}
