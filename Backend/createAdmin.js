import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const hashedPassword = await bcrypt.hash("admin123", 10);

await User.create({
  email: "admin@test.com",
  password: hashedPassword,
  role: "admin",
});

console.log("Admin created");
process.exit();