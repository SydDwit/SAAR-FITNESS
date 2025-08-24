"use client";
import { useEffect, useState } from "react";

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
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={create} className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold">Add Staff</h2>
        <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <input className="input" placeholder="Notification Email (optional)" value={form.notifyEmail} onChange={e=>setForm({...form, notifyEmail:e.target.value})}/>
        <button className="btn">Create</button>
      </form>
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-2">Staff List</h2>
        <ul className="space-y-2">
          {list.map(s => (
            <li key={s._id} className="flex items-center justify-between border border-slate-800 rounded-xl p-3">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-slate-400">{s.email}</div>
              </div>
              <button className="badge text-red-300 border-red-500" onClick={()=>remove(s._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
