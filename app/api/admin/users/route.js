import { Admin, Staff } from "@/lib/models";
import { requireAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/users - List all admin users
 */
export async function GET() {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const admins = await Admin.find().select("-passwordHash").sort("name").lean();
    const staff = await Staff.find().select("-passwordHash").sort("name").lean();
    
    return Response.json({ 
      admins: admins.map(a => ({ ...a, role: "admin" })),
      staff: staff.map(s => ({ ...s, role: "staff" }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/users - Create a new admin user
 */
export async function POST(req) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return Response.json(
        { error: "Missing required fields: email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "staff"].includes(role)) {
      return Response.json(
        { error: "Invalid role. Must be 'admin' or 'staff'" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in appropriate collection
    let user;
    if (role === "admin") {
      // Check if admin already exists
      const existing = await Admin.findOne({ email });
      if (existing) {
        return Response.json(
          { error: "Admin user with this email already exists" },
          { status: 409 }
        );
      }
      
      user = await Admin.create({
        name,
        email,
        passwordHash,
        role: "admin",
        isActive: true
      });
    } else {
      // Check if staff already exists
      const existing = await Staff.findOne({ email });
      if (existing) {
        return Response.json(
          { error: "Staff user with this email already exists" },
          { status: 409 }
        );
      }
      
      user = await Staff.create({
        name,
        email,
        passwordHash,
        role: "staff",
        isActive: true
      });
    }

    return Response.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users?id=xxx - Update user role or status
 */
export async function PATCH(req) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { role, isActive } = body;

    // Determine which collection to update
    const currentRole = searchParams.get("currentRole") || body.currentRole;
    
    if (!currentRole) {
      return Response.json(
        { error: "currentRole parameter is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (role && ["admin", "staff"].includes(role)) {
      updateData.role = role;
    }

    // Update in the appropriate collection
    let user;
    if (currentRole === "admin") {
      user = await Admin.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-passwordHash");
    } else {
      user = await Staff.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-passwordHash");
    }

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ ok: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users?id=xxx - Delete a user (admin only)
 */
export async function DELETE(req) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");

    if (!id || !role) {
      return Response.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (authCheck.session.user.id === id) {
      return Response.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete from appropriate collection
    if (role === "admin") {
      await Admin.findByIdAndDelete(id);
    } else {
      await Staff.findByIdAndDelete(id);
    }

    return Response.json({ ok: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
