import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const hashedPassword = await bcrypt.hash("moderator123", 10);

await User.create({
  email: "moderator@test.com",
  password: hashedPassword,
  role: "moderator",
});

console.log("Moderator created");
process.exit();
