"use client";
import { useEffect, useState } from "react";
import Icon from "@/app/components/Icon";
import PageContainer from "@/app/components/PageContainer";

export default function MembersAdmin(){
  const [list,setList] = useState([]);
  const [q,setQ] = useState("");
  const [activeTab, setActiveTab] = useState("members"); // members or admins
  
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

  async function togglePayment(memberId, currentStatus) {
    try {
      const newStatus = currentStatus === 'paid' ? 'due' : 'paid';
      
      // Optimistically update UI immediately
      setList(prevList => 
        prevList.map(m => 
          m._id === memberId 
            ? { ...m, paymentStatus: newStatus }
            : m
        )
      );
      
      const res = await fetch(`/api/members?id=${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      
      const data = await res.json();
      
      if (!data.ok) {
        // Revert on error
        console.error('Toggle failed:', data.error);
        alert('Failed to update payment status: ' + (data.error || 'Unknown error'));
        await load(); // Reload to get correct state
      }
    } catch (error) {
      console.error('Error toggling payment:', error);
      alert('Failed to update payment status: ' + error.message);
      await load(); // Reload to get correct state
    }
  }
  return (
    <PageContainer className="p-6 space-y-4">
      {/* Header with tabs and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-6">
          <button 
            className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'members' 
                ? 'text-purple-500 border-purple-500' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button 
            className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'admins' 
                ? 'text-purple-500 border-purple-500' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('admins')}
          >
            Admins
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Total members: <strong className="text-white">{list.length}</strong></span>
          <span className="mx-2">•</span>
          <span>Active users: <strong className="text-white">{list.filter(m => m.status === 'active').length}</strong></span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <a 
            href="/admin/members/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add new
          </a>
          <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Icon name="download" className="w-4 h-4" />
            Import members
          </button>
          <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Icon name="file-export" className="w-4 h-4" />
            Export members (Excel)
          </button>
        </div>
        
        <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Icon name="filter" className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-800">
        <div className="relative w-full md:w-96">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Icon name="search" className="text-zinc-500 w-5 h-5" />
          </span>
          <input 
            className="w-full pl-10 pr-4 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-zinc-800 text-white placeholder-zinc-500"
            name="search"
            autoComplete="off"
            placeholder="Search members..." 
            value={q} 
            onChange={e=>setQ(e.target.value)}
          />
        </div>
      </div>
      
      {/* Members table */}
      <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr className="text-left">
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Member name</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">Payment Status</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">Operation</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-zinc-500">
                    {q ? "No members found matching your search" : "No members have been added yet"}
                  </td>
                </tr>
              ) : (
                list.map((m) => (
                  <tr key={m._id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {m.name?.charAt(0).toUpperCase() || 'M'}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-sm font-medium text-white">{m.name}</td>
                    <td className="px-6 py-4 align-middle text-sm text-zinc-300">{m.phone || 'N/A'}</td>
                    <td className="px-6 py-4 align-middle text-sm text-zinc-300">{m.email || 'N/A'}</td>
                    <td className="px-6 py-4 align-middle text-center">
                      <button
                        onClick={() => togglePayment(m._id, m.paymentStatus || 'due')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          m.paymentStatus === 'paid'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20'
                            : m.paymentStatus === 'partial'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20'
                        }`}
                      >
                        {m.paymentStatus === 'paid' ? (
                          <>
                            <Icon name="check" className="w-3 h-3" />
                            Paid
                          </>
                        ) : m.paymentStatus === 'partial' ? (
                          <>
                            <Icon name="exclamation-triangle" className="w-3 h-3" />
                            Partial
                          </>
                        ) : (
                          <>
                            <Icon name="xmark" className="w-3 h-3" />
                            Unpaid
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors" title="View">
                          <Icon name="eye" className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors" title="Edit">
                          <Icon name="pen-to-square" className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={()=>remove(m._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors" 
                          title="Delete"
                        >
                          <Icon name="trash-can" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors">
                        More
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}
