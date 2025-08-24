import Link from "next/link";

export default function AdminHome(){
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-8 border-l-4 border-l-rose-600 hover:shadow-lg hover:shadow-rose-900/10 transition-shadow">
          <h2 className="text-2xl font-semibold text-white">Manage Staff</h2>
          <p className="text-zinc-400 mt-2">Create, list and remove staff users.</p>
          <Link href="/admin/staff" className="btn mt-6 inline-block bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20">Open</Link>
        </div>
        <div className="card p-8 border-l-4 border-l-rose-600 hover:shadow-lg hover:shadow-rose-900/10 transition-shadow">
          <h2 className="text-2xl font-semibold text-white">Manage Members</h2>
          <p className="text-zinc-400 mt-2">View all members and status.</p>
          <Link href="/admin/members" className="btn mt-6 inline-block bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20">Open</Link>
        </div>
      </div>
    </div>
  )
}
