import { Member } from "@/lib/models";
import { requireMember, validateMemberOwnership } from "@/lib/rbac";

/**
 * GET /api/member/profile - Get member's own profile
 */
export async function GET(req) {
  const authCheck = await requireMember();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const memberId = authCheck.session.user.id;
    const member = await Member.findById(memberId)
      .select("-passwordHash -__v")
      .lean();

    if (!member) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return Response.json(member);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/member/profile - Update member's own profile (limited fields)
 */
export async function PATCH(req) {
  const authCheck = await requireMember();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const memberId = authCheck.session.user.id;
    const body = await req.json();

    // Only allow updating specific fields
    const allowedFields = ["weightKg", "heightCm"];
    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Recalculate BMI if height or weight changed
    if (updateData.heightCm || updateData.weightKg) {
      const currentMember = await Member.findById(memberId);
      const height = updateData.heightCm || currentMember.heightCm;
      const weight = updateData.weightKg || currentMember.weightKg;

      if (height && weight) {
        updateData.bmi = (weight / Math.pow(height / 100, 2));
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedMember) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return Response.json({ ok: true, member: updatedMember });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
