import { Payment } from "@/lib/models";
import { requireMember } from "@/lib/rbac";

/**
 * GET /api/member/payments - Get member's payment history
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

    const payments = await Payment.find({ memberId })
      .sort({ paymentDate: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Payment.countDocuments({ memberId });
    const totalPaid = await Payment.aggregate([
      { $match: { memberId: memberId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return Response.json({
      payments,
      total,
      totalPaid: totalPaid[0]?.total || 0,
      hasMore: total > skip + limit,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
