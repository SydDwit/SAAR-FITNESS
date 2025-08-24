import Link from "next/link";

export default function AdminHome(){
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Manage Staff</h2>
        <p className="text-slate-400">Create, list and remove staff users.</p>
        <Link href="/admin/staff" className="btn mt-4 inline-block">Open</Link>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Manage Members</h2>
        <p className="text-slate-400">View all members and status.</p>
        <Link href="/admin/members" className="btn mt-4 inline-block">Open</Link>
      </div>
    </div>
  )
}
