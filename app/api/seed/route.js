import { Admin } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function POST(){
  const email = "admin@saarfitness.local";
  const exists = await Admin.findOne({ email });
  if (exists) return Response.json({ ok:true, note:"admin exists" });
  const passwordHash = await bcrypt.hash("admin123", 10);
  await Admin.create({ name:"Super Admin", email, passwordHash, role:"admin" });
  return Response.json({ ok:true, email, password:"admin123" });
}
export async function GET(){ return POST(); }
