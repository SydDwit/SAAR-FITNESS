import mongoose from "mongoose";

const globalAny = global;

const adminConn = globalAny._adminConn || mongoose.createConnection(process.env.MONGODB_URI_ADMIN || "", { dbName: process.env.MONGODB_DBNAME_ADMIN || "saarfitness_admin" });
const staffConn = globalAny._staffConn || mongoose.createConnection(process.env.MONGODB_URI_STAFF || "", { dbName: process.env.MONGODB_DBNAME_STAFF || "saarfitness_staff" });
const memberConn = globalAny._memberConn || mongoose.createConnection(process.env.MONGODB_URI_MEMBERS || "", { dbName: process.env.MONGODB_DBNAME_MEMBERS || "saarfitness_members" });

if (!globalAny._adminConn) globalAny._adminConn = adminConn;
if (!globalAny._staffConn) globalAny._staffConn = staffConn;
if (!globalAny._memberConn) globalAny._memberConn = memberConn;

export { adminConn, staffConn, memberConn };
