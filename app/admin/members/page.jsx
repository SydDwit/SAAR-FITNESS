"use client";
import { useEffect, useState } from "react";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">All Members</h2>
      <input className="input" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)}/>
      <div className="card p-4">
        <table className="table">
          <thead><tr><th>Name</th><th>Plan</th><th>Status</th><th>Ends</th><th></th></tr></thead>
          <tbody>
            {list.map(m => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.planType}</td>
                <td>{m.status}</td>
                <td>{new Date(m.endDate).toLocaleDateString()}</td>
                <td><button className="badge text-red-300 border-red-500" onClick={()=>remove(m._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
