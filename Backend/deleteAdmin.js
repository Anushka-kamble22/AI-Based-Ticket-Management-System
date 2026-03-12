import mongoose from "mongoose";
import User from "./models/user.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await User.deleteOne({ email: "admin@test.com" });

console.log("Admin user deleted");
process.exit();
