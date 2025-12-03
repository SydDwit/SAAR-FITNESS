import mongoose from "mongoose";

const globalAny = global;

// Connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const adminConn = globalAny._adminConn || mongoose.createConnection(
  process.env.MONGODB_URI_ADMIN || "mongodb://127.0.0.1:27017/saarfitness_admin", 
  options
);

const staffConn = globalAny._staffConn || mongoose.createConnection(
  process.env.MONGODB_URI_STAFF || "mongodb://127.0.0.1:27017/saarfitness_staff", 
  options
);

const memberConn = globalAny._memberConn || mongoose.createConnection(
  process.env.MONGODB_URI_MEMBERS || "mongodb://127.0.0.1:27017/saarfitness_members", 
  options
);

if (!globalAny._adminConn) globalAny._adminConn = adminConn;
if (!globalAny._staffConn) globalAny._staffConn = staffConn;
if (!globalAny._memberConn) globalAny._memberConn = memberConn;

// Log connection events
adminConn.on('connected', () => console.log('✓ Admin DB connected'));
adminConn.on('error', (err) => console.error('✗ Admin DB error:', err.message));

staffConn.on('connected', () => console.log('✓ Staff DB connected'));
staffConn.on('error', (err) => console.error('✗ Staff DB error:', err.message));

memberConn.on('connected', () => console.log('✓ Member DB connected'));
memberConn.on('error', (err) => console.error('✗ Member DB error:', err.message));

export { adminConn, staffConn, memberConn };
