/**
 * Script to add email and password to existing members
 * Run with: node scripts/add-member-credentials.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

// Database URI - update this to match your configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saar-fitness";

// Member Schema (minimal version for this script)
const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  phoneNumber: String,
  age: Number,
  gender: String,
  address: String,
  emergencyContact: String,
  planType: String,
  feeAmount: Number,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  subscriptionStatus: String,
  weightKg: Number,
  heightCm: Number,
  bmi: Number,
  assignedTrainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date,
});

const Member = mongoose.model("Member", memberSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function addCredentialsToMember(memberId, email, password) {
  try {
    // Check if email already exists
    const existingMember = await Member.findOne({ email, _id: { $ne: memberId } });
    if (existingMember) {
      console.log(`✗ Email ${email} is already in use by another member`);
      return false;
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Update member
    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      { email, passwordHash, isActive: true },
      { new: true }
    );

    if (updatedMember) {
      console.log(`✓ Updated member: ${updatedMember.name}`);
      console.log(`  Email: ${email}`);
      return true;
    } else {
      console.log(`✗ Member not found with ID: ${memberId}`);
      return false;
    }
  } catch (error) {
    console.error("✗ Error updating member:", error.message);
    return false;
  }
}

async function addCredentialsToAllMembers() {
  try {
    const membersWithoutEmail = await Member.find({
      $or: [{ email: { $exists: false } }, { email: "" }, { email: null }],
    });

    console.log(`\nFound ${membersWithoutEmail.length} members without email credentials\n`);

    if (membersWithoutEmail.length === 0) {
      console.log("All members already have email credentials!");
      return;
    }

    for (const member of membersWithoutEmail) {
      console.log(`\n--- Member: ${member.name} (ID: ${member._id}) ---`);
      console.log(`Phone: ${member.phoneNumber || "N/A"}`);
      console.log(`Plan: ${member.planType || "N/A"}`);

      const email = await question("Enter email address (or 'skip' to skip): ");
      if (email.toLowerCase() === "skip") {
        console.log("Skipped.");
        continue;
      }

      if (!email.includes("@")) {
        console.log("✗ Invalid email format. Skipped.");
        continue;
      }

      const password = await question("Enter password (min 6 characters): ");
      if (password.length < 6) {
        console.log("✗ Password too short. Skipped.");
        continue;
      }

      await addCredentialsToMember(member._id, email, password);
    }

    console.log("\n✓ All members processed!");
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

async function addCredentialsToSingleMember() {
  try {
    const memberId = await question("Enter member ID: ");
    const member = await Member.findById(memberId);

    if (!member) {
      console.log(`✗ Member not found with ID: ${memberId}`);
      return;
    }

    console.log(`\nMember: ${member.name}`);
    console.log(`Current email: ${member.email || "Not set"}`);

    const email = await question("Enter new email address: ");
    if (!email.includes("@")) {
      console.log("✗ Invalid email format.");
      return;
    }

    const password = await question("Enter password (min 6 characters): ");
    if (password.length < 6) {
      console.log("✗ Password too short.");
      return;
    }

    await addCredentialsToMember(member._id, email, password);
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

async function listMembers() {
  try {
    const members = await Member.find().select("name email phoneNumber planType isActive");
    console.log(`\nTotal members: ${members.length}\n`);

    members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name} (ID: ${member._id})`);
      console.log(`   Email: ${member.email || "NOT SET"}`);
      console.log(`   Phone: ${member.phoneNumber || "N/A"}`);
      console.log(`   Plan: ${member.planType || "N/A"}`);
      console.log(`   Active: ${member.isActive ? "Yes" : "No"}`);
      console.log("");
    });
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

async function main() {
  await connectDB();

  console.log("\n=== Member Credentials Management ===\n");
  console.log("1. Add credentials to all members without email");
  console.log("2. Add credentials to a single member");
  console.log("3. List all members");
  console.log("4. Exit\n");

  const choice = await question("Choose an option (1-4): ");

  switch (choice) {
    case "1":
      await addCredentialsToAllMembers();
      break;
    case "2":
      await addCredentialsToSingleMember();
      break;
    case "3":
      await listMembers();
      break;
    case "4":
      console.log("Goodbye!");
      break;
    default:
      console.log("Invalid choice.");
  }

  rl.close();
  await mongoose.disconnect();
  console.log("\n✓ Disconnected from MongoDB");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
