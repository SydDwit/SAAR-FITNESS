import { Member } from "@/lib/models";
import { memberConn } from "@/lib/db";
import { requireStaffOrAdmin } from "@/lib/rbac";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(req) {
  // Verify authorization
  const authCheck = await requireStaffOrAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  await memberConn;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "name";
  const query = q ? { name: { $regex: q, $options: "i" } } : {};
  const members = await Member.find(query).sort(sort).limit(500).lean();
  return Response.json({ members });
}

export async function POST(req) {
  // Verify authorization
  const authCheck = await requireStaffOrAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    const form = await req.formData();
    const name = form.get("name");
    const age = Number(form.get("age") || 0);
    const gender = form.get("gender") || "Other";
    const planType = form.get("planType") || "General";
    const heightCm = Number(form.get("heightCm") || 0);
    const weightKg = Number(form.get("weightKg") || 0);
    const bmi = Number(form.get("bmi") || 0);
    const subscriptionMonths = Number(form.get("subscriptionMonths") || 1);
    const startDateStr = form.get("startDate") || new Date().toISOString().slice(0,10);
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth()+subscriptionMonths);

    let photoUrl = "";
    const file = form.get("photo");
    if (file && typeof file === "object" && file.arrayBuffer) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`.replace(/\s+/g,"_");
      const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
      await writeFile(uploadPath, buffer);
      photoUrl = `/uploads/${filename}`;
    }

    const paymentStatus = form.get("paymentStatus") || "due";

    const saved = await Member.create({
      name, age, gender, planType, heightCm, weightKg, bmi, subscriptionMonths, startDate, endDate, status: "active",
      paymentStatus,
      photoUrl,
      createdById: authCheck.session.user.id
    });

    return Response.json({ ok: true, id: saved._id });
  } catch (e) {
    console.error(e);
    return Response.json({ ok:false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req){
  // Verify authorization
  const authCheck = await requireStaffOrAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  await memberConn;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ ok:false, error:"missing id" }, { status: 400 });
  
  try {
    const body = await req.json();
    console.log('PATCH request body:', body);
    const updateData = {};
    
    if (body.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus;
    }
    
    console.log('Updating member', id, 'with data:', updateData);
    const updated = await Member.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );
    console.log('Updated member:', JSON.stringify(updated, null, 2));
    console.log('Updated member paymentStatus specifically:', updated?.paymentStatus);
    
    if (!updated) {
      return Response.json({ ok:false, error:"Member not found" }, { status: 404 });
    }
    
    return Response.json({ ok:true, member: updated });
  } catch (e) {
    console.error('PATCH error:', e);
    return Response.json({ ok:false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req){
  // Verify authorization - Only admins can delete
  const authCheck = await requireStaffOrAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ ok:false, error:"missing id" }, { status: 400 });
  await Member.findByIdAndDelete(id);
  return Response.json({ ok:true });
}
