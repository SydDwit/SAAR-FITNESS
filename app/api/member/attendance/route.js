import { Attendance } from "@/lib/models";
import { requireMember } from "@/lib/rbac";

/**
 * GET /api/member/attendance - Get member's attendance records
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    const attendance = await Attendance.find({ memberId })
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Attendance.countDocuments({ memberId });

    return Response.json({
      attendance,
      total,
      hasMore: total > skip + limit,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
