import { Staff } from "@/lib/models";
import { requireAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function GET() {
  // Only admins can view staff list
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const staff = await Staff.find().sort("name").lean();
  return Response.json({ staff });
}

export async function POST(req){
  // Only admins can create staff
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const body = await req.json();
  const { name, email, password, notifyEmail } = body;
  if (!email || !password) return Response.json({ ok:false, error:"Missing email or password"}, { status: 400 });
  
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = await Staff.create({ name, email, passwordHash, role:"staff", notifyEmail });
  return Response.json({ ok:true, id: doc._id });
}

export async function DELETE(req){
  // Only admins can delete staff
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await Staff.findByIdAndDelete(id);
  return Response.json({ ok:true });
}
