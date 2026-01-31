#!/usr/bin/env node

/**
 * Script to create admin users
 * Usage: node scripts/create-admin.js
 */

import { Admin } from "../lib/models.js";
import { adminConn } from "../lib/db.js";
import bcrypt from "bcryptjs";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log("=================================");
  console.log("   SAAR FITNESS Admin Creator    ");
  console.log("=================================\n");

  try {
    // Wait for DB connection
    await new Promise((resolve) => {
      if (adminConn.readyState === 1) {
        resolve();
      } else {
        adminConn.once("connected", resolve);
      }
    });

    const name = await question("Enter admin name: ");
    const email = await question("Enter admin email: ");
    const password = await question("Enter admin password: ");

    if (!name || !email || !password) {
      console.error("\n❌ All fields are required!");
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("\n❌ Invalid email format!");
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.error("\n❌ An admin with this email already exists!");
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("\nDetails:");
    console.log(`  ID:    ${admin._id}`);
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
    console.log("\n🔐 You can now login with these credentials\n");
  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await adminConn.close();
    process.exit(0);
  }
}

createAdmin();
