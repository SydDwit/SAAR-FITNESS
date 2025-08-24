"use client";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";

export default function StaffAdmin(){
  const [list,setList] = useState([]);
  const [form,setForm] = useState({ name:"", email:"", password:"", notifyEmail:"" });
  async function load(){
    const r = await fetch("/api/staff");
    const d = await r.json();
    setList(d.staff||[]);
  }
  useEffect(()=>{ load(); },[]);

  async function create(e){
    e.preventDefault();
    const r = await fetch("/api/staff",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.ok){ setForm({ name:"", email:"", password:"", notifyEmail:"" }); load(); }
    else alert(d.error||"error");
  }
  async function remove(id){
    if (!confirm("Delete staff?")) return;
    await fetch(`/api/staff?id=${id}`,{ method:"DELETE" });
    load();
  }
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Staff Management</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={create} autoComplete="off" className="card p-8 shadow-xl border-t-4 border-t-rose-600">
            <h2 className="text-2xl font-semibold text-white mb-6">Add Staff</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Name</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="user" className="text-zinc-500 w-5 h-5" />
                  </span>
                  <input 
                    className="input pl-9"
                    name="name"
                    autoComplete="off"
                    placeholder="Full Name" 
                    value={form.name} 
                    onChange={e=>setForm({...form, name:e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="mail" className="text-zinc-500 w-5 h-5" />
                  </span>
                  <input 
                    className="input pl-9"
                    name="email"
                    autoComplete="email"
                    placeholder="staff@example.com" 
                    value={form.email} 
                    onChange={e=>setForm({...form, email:e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="lock" className="text-zinc-500 w-5 h-5" />
                  </span>
                  <input 
                    className="input pl-9"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Secure Password" 
                    type="password" 
                    value={form.password} 
                    onChange={e=>setForm({...form, password:e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Notification Email (optional)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="bell" className="text-zinc-500 w-5 h-5" />
                  </span>
                  <input 
                    className="input pl-9"
                    name="notifyEmail"
                    autoComplete="off" 
                    placeholder="notifications@example.com" 
                    value={form.notifyEmail} 
                    onChange={e=>setForm({...form, notifyEmail:e.target.value})}
                  />
                </div>
              </div>
            </div>
            <button className="btn w-full mt-8 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20">Create</button>
          </form>
        </div>
        
        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Staff List</h2>
          {list.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">No staff members added yet</div>
          ) : (
            <ul className="space-y-3">
              {list.map(s => (
                <li key={s._id} className="flex items-center justify-between bg-zinc-900/50 rounded-xl p-4 hover:bg-zinc-900 transition-colors">
                  <div>
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-sm text-zinc-400">{s.email}</div>
                  </div>
                  <button 
                    className="px-3 py-1 rounded-md bg-rose-600/10 border border-rose-500 text-rose-300 hover:bg-rose-600/20 transition-colors" 
                    onClick={()=>remove(s._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
