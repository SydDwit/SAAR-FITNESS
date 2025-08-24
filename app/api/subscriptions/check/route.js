import { Member, Staff } from "@/lib/models";
import { getTransport } from "@/lib/mail";

export async function POST(){
  const now = new Date();
  const expired = await Member.find({ endDate: { $lt: now }, status: { $ne: "expired" } }).lean();
  if (expired.length) {
    const ids = expired.map(m => m._id);
    await Member.updateMany({ _id: { $in: ids } }, { $set: { status: "expired" } });
    const transporter = getTransport();
    if (transporter) {
      // notify all staff
      const staff = await Staff.find().lean();
      const to = staff.map(s => s.notifyEmail || s.email).join(",");
      if (to) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "no-reply@saarfitness.local",
          to,
          subject: "SAAR FITNESS: Expired subscriptions",
          text: expired.map(m => `${m.name} expired on ${new Date(m.endDate).toDateString()}`).join("\n"),
        });
      }
    }
  }
  return Response.json({ expired });
}
