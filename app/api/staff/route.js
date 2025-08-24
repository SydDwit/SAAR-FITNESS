import { Staff } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function GET() {
  const staff = await Staff.find().sort("name").lean();
  return Response.json({ staff });
}
export async function POST(req){
  const body = await req.json();
  const { name, email, password, notifyEmail } = body;
  if (!email || !password) return Response.json({ ok:false, error:"Missing email or password"}, { status: 400 });
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = await Staff.create({ name, email, passwordHash, role:"staff", notifyEmail });
  return Response.json({ ok:true, id: doc._id });
}
export async function DELETE(req){
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await Staff.findByIdAndDelete(id);
  return Response.json({ ok:true });
}
