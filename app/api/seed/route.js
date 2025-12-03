import { Admin, Staff, Member } from "@/lib/models";
import { adminConn, staffConn, memberConn } from "@/lib/db";
import bcrypt from "bcryptjs";

// Random data generators - Nepali names
const firstNames = ["Sid", "Ishal", "Kaustup", "Suhan", "Aayush", "Bikram", "Shreya", "Priya", "Sanjana", "Anish", "Rohan", "Prajwal", "Diksha", "Namrata", "Sujan", "Pratik", "Kritika", "Binita", "Ashish", "Sajana"];
const lastNames = ["Shakya", "Rana", "Thapa", "Ranjitkar", "Shrestha", "Karki", "Adhikari", "Pandey", "Gurung", "Tamang", "Magar", "Maharjan", "Pradhan", "Joshi", "Bhandari", "Basnet", "Poudel", "Khadka", "Limbu", "Sherpa"];
const planTypes = ["General", "Personal", "Weight Loss"];
const genders = ["Male", "Female", "Other"];
const trainerSpecializations = ["Yoga", "Cardio", "Strength Training", "CrossFit", "Pilates", "HIIT"];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
}

function calculateBMI(heightCm, weightKg) {
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

export async function POST(){
  try {
    const results = {
      admin: null,
      trainers: [],
      members: [],
      errors: []
    };

    // Wait for database connections
    console.log("Waiting for database connections...");
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();
    
    while ((adminConn.readyState !== 1 || staffConn.readyState !== 1 || memberConn.readyState !== 1) 
           && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log("Admin DB state:", adminConn.readyState);
    console.log("Staff DB state:", staffConn.readyState);
    console.log("Member DB state:", memberConn.readyState);
    
    if (adminConn.readyState !== 1 || staffConn.readyState !== 1 || memberConn.readyState !== 1) {
      return Response.json({ 
        ok: false, 
        error: "Database connection timeout. Please try again.",
        states: {
          admin: adminConn.readyState,
          staff: staffConn.readyState,
          member: memberConn.readyState
        }
      }, { status: 503 });
    }
    
    console.log("✓ All databases connected");

    // 1. Create Admin
    const adminEmail = "admin@saarfitness.local";
    const adminExists = await Admin.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      const admin = await Admin.create({ 
        name: "Super Admin", 
        email: adminEmail, 
        passwordHash, 
        role: "admin" 
      });
      results.admin = { email: adminEmail, password: "admin123", created: true };
      console.log("✓ Admin created");
    } else {
      results.admin = { email: adminEmail, password: "admin123", created: false, note: "already exists" };
      console.log("✓ Admin already exists");
    }

    // 2. Create 6 Trainers
    console.log("\nCreating trainers...");
    const trainerNames = [
      { first: "Sid", last: "Shakya" },
      { first: "Ishal Bikram", last: "Rana" },
      { first: "Kaustup", last: "Thapa" },
      { first: "Suhan", last: "Ranjitkar" },
      { first: "Aayush", last: "Shrestha" },
      { first: "Shreya", last: "Karki" }
    ];

    for (let i = 0; i < trainerNames.length; i++) {
      const { first, last } = trainerNames[i];
      const email = generateEmail(first, last);
      
      const exists = await Staff.findOne({ email });
      if (!exists) {
        const passwordHash = await bcrypt.hash("trainer123", 10);
        const trainer = await Staff.create({
          name: `${first} ${last}`,
          email: email,
          passwordHash: passwordHash,
          role: "staff",
          phone: `+977-98${randomInt(10, 99)}-${randomInt(100000, 999999)}`,
          notifyEmail: email,
          specialization: randomElement(trainerSpecializations)
        });
        results.trainers.push({ 
          name: `${first} ${last}`, 
          email, 
          password: "trainer123",
          specialization: trainer.specialization
        });
        console.log(`✓ Trainer created: ${first} ${last}`);
      } else {
        results.trainers.push({ 
          name: `${first} ${last}`, 
          email, 
          note: "already exists" 
        });
        console.log(`- Trainer exists: ${first} ${last}`);
      }
    }

    // 3. Create 20 Members
    console.log("\nCreating members...");
    const usedEmails = new Set();
    const usedNames = new Set();
    
    for (let i = 0; i < 20; i++) {
      let firstName, lastName, fullName;
      
      // Ensure unique name combination
      do {
        firstName = randomElement(firstNames);
        lastName = randomElement(lastNames);
        fullName = `${firstName} ${lastName}`;
      } while (usedNames.has(fullName));
      
      usedNames.add(fullName);
      
      let email = generateEmail(firstName, lastName);
      
      // Ensure unique email
      let counter = 1;
      while (usedEmails.has(email) || await Member.findOne({ email })) {
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@example.com`;
        counter++;
      }
      usedEmails.add(email);
      
      const gender = randomElement(genders);
      const age = randomInt(18, 65);
      const heightCm = randomInt(150, 200);
      const weightKg = randomInt(50, 120);
      const bmi = calculateBMI(heightCm, weightKg);
      const planType = randomElement(planTypes);
      const subscriptionMonths = randomElement([1, 3, 6, 12]);
      
      // Random start date within last 6 months
      const daysAgo = randomInt(0, 180);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + subscriptionMonths);
      
      // Determine status based on end date
      const now = new Date();
      const status = endDate > now ? "active" : "expired";
      const paymentStatus = Math.random() > 0.2 ? "paid" : (Math.random() > 0.5 ? "due" : "partial");
      
      try {
        const member = await Member.create({
          name: `${firstName} ${lastName}`,
          email: email,
          age: age,
          gender: gender,
          planType: planType,
          heightCm: heightCm,
          weightKg: weightKg,
          bmi: parseFloat(bmi),
          subscriptionMonths: subscriptionMonths,
          startDate: startDate,
          endDate: endDate,
          status: status,
          photoUrl: "",
          paymentStatus: paymentStatus,
          paymentHistory: [],
          phone: `+977-98${randomInt(10, 99)}-${randomInt(100000, 999999)}`
        });
        
        results.members.push({ 
          name: `${firstName} ${lastName}`, 
          email, 
          status,
          plan: planType,
          paymentStatus
        });
        console.log(`✓ Member ${i + 1}/20: ${firstName} ${lastName} (${status})`);
      } catch (err) {
        results.errors.push({ member: `${firstName} ${lastName}`, error: err.message });
        console.error(`✗ Failed to create member: ${firstName} ${lastName}`, err.message);
      }
    }

    console.log("\n=== Seeding Complete ===");
    console.log(`Admin: ${results.admin.created ? 'Created' : 'Exists'}`);
    console.log(`Trainers: ${results.trainers.length} processed`);
    console.log(`Members: ${results.members.length} created`);
    console.log(`Errors: ${results.errors.length}`);
    
    return Response.json({ 
      ok: true, 
      message: "Database seeded successfully",
      results: results
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
export async function GET(){ return POST(); }
