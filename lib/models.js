import { adminConn, staffConn, memberConn } from "./db.js";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin","staff","member"], required: true },
  notifyEmail: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: String,
  phoneNumber: String,
  age: Number,
  gender: { type: String, enum: ["Male","Female","Other"] },
  planType: String,
  bmi: Number,
  heightCm: Number,
  weightKg: Number,
  subscriptionMonths: Number,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ["active","expired"], default: "active" },
  paymentStatus: { type: String, enum: ["paid","due","partial"], default: "due" },
  photoUrl: String,
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  assignedTrainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: Date,
  date: { type: Date, required: true },
  notes: String
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ["cash", "card", "online", "upi"], default: "cash" },
  status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
  description: String,
  receiptNumber: String
}, { timestamps: true });

export const Admin = adminConn.models.Admin || adminConn.model("Admin", userSchema);
export const Staff = staffConn.models.Staff || staffConn.model("Staff", userSchema);
export const Member = memberConn.models.Member || memberConn.model("Member", memberSchema);
export const Attendance = memberConn.models.Attendance || memberConn.model("Attendance", attendanceSchema);
export const Payment = memberConn.models.Payment || memberConn.model("Payment", paymentSchema);
