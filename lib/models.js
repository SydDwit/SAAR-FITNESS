import { adminConn, staffConn, memberConn } from "./db.js";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin","staff"], required: true },
  notifyEmail: String
}, { timestamps: true });

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
  photoUrl: String,
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" }
}, { timestamps: true });

export const Admin = adminConn.models.Admin || adminConn.model("Admin", userSchema);
export const Staff = staffConn.models.Staff || staffConn.model("Staff", userSchema);
export const Member = memberConn.models.Member || memberConn.model("Member", memberSchema);
