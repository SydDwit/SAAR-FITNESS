import { Member } from "@/lib/models";
import { requireMember } from "@/lib/rbac";

/**
 * GET /api/member/membership - Get member's membership information
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
      .select("name planType subscriptionMonths startDate endDate status paymentStatus")
      .lean();

    if (!member) {
      return new Response(JSON.stringify({ error: "Membership not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(member.endDate);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    return Response.json({
      ...member,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: member.status === "expired" || daysRemaining < 0,
    });
  } catch (error) {
    console.error("Error fetching membership:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
