"use client";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";
import PageContainer from "@/app/components/PageContainer";

export default function StaffAdmin(){
  const [list,setList] = useState([]);
  const [q,setQ] = useState("");
  
  async function load(){
    const r = await fetch("/api/staff");
    const d = await r.json();
    setList(d.staff||[]);
  }
  useEffect(()=>{ load(); },[]);

  async function remove(id){
    if (!confirm("Delete trainer?")) return;
    await fetch(`/api/staff?id=${id}`,{ method:"DELETE" });
    load();
  }
  
  const filteredList = list.filter(s => 
    !q || s.name?.toLowerCase().includes(q.toLowerCase()) || s.email?.toLowerCase().includes(q.toLowerCase())
  );
  
  return (
    <PageContainer className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Trainer Management</h1>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="w-full md:w-64 relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" className="text-zinc-500 w-4 h-4" />
            </span>
            <input 
              className="input pl-16 placeholder-indent"
              name="search"
              autoComplete="off"
              placeholder="Search staff..." 
              value={q} 
              onChange={e=>setQ(e.target.value)}
              style={{ textIndent: "20px" }}
            />
          </div>
          
          <a 
            href="/admin/staff/new"
            className="btn bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-white font-medium rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add Trainer
          </a>
        </div>
      </div>
      
      <div className="card p-6 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-zinc-900">
              <tr className="text-left border-b border-zinc-800">
                <th className="px-4 py-3 font-medium text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Notification Email</th>
                <th className="px-4 py-3 font-medium text-zinc-300"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-zinc-400">
                    {q ? "No trainers found matching your search" : "No trainers have been added yet"}
                  </td>
                </tr>
              ) : (
                filteredList.map((s, index) => (
                  <tr key={s._id} className={`hover:bg-zinc-900/50 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/20' : ''}`}>
                    <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-rose-500/10 text-rose-300 border border-rose-500">
                        {s.role || 'staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{s.notifyEmail || '-'}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="px-3 py-1 rounded-md bg-rose-600/10 border border-rose-500 text-rose-300 hover:bg-rose-600/20 transition-colors" 
                        onClick={()=>remove(s._id)}
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
        
        {filteredList.length > 0 && (
          <div className="mt-4 text-right text-sm text-zinc-500">
            Showing {filteredList.length} {filteredList.length === 1 ? 'trainer' : 'trainers'}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
