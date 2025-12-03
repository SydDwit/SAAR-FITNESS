import mongoose from 'mongoose';

const memberConn = mongoose.createConnection(
  process.env.MONGODB_URI_MEMBERS || "mongodb://127.0.0.1:27017/saarfitness_members"
);

const memberSchema = new mongoose.Schema({
  name: String,
  paymentStatus: { type: String, enum: ["paid","due","partial"], default: "due" }
}, { strict: false });

const Member = memberConn.model("Member", memberSchema);

async function addPaymentStatus() {
  try {
    await memberConn.asPromise();
    console.log('✓ Connected to database');

    // Update all members without paymentStatus field
    const result = await Member.updateMany(
      { paymentStatus: { $exists: false } },
      { $set: { paymentStatus: "due" } }
    );

    console.log(`✓ Updated ${result.modifiedCount} members with default paymentStatus: "due"`);
    
    // Verify the update
    const members = await Member.find({}, 'name paymentStatus').limit(5);
    console.log('\nSample members:');
    members.forEach(m => console.log(`  - ${m.name}: ${m.paymentStatus}`));
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

addPaymentStatus();
