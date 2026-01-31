// Migration script to add isActive field to existing users
import { adminConn, staffConn } from "../lib/db.js";
import { Admin, Staff } from "../lib/models.js";

async function migrate() {
  console.log("🔄 Starting migration: Adding isActive field to users...");

  try {
    // Update admins
    const adminResult = await Admin.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✓ Updated ${adminResult.modifiedCount} admin users`);

    // Update staff
    const staffResult = await Staff.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✓ Updated ${staffResult.modifiedCount} staff users`);

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await adminConn.close();
    await staffConn.close();
    process.exit(0);
  }
}

migrate();
