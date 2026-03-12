import mongoose from "mongoose";
import Ticket from "./models/ticket.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Get all tickets with lowercase priority
const tickets = await Ticket.find({ priority: { $in: ["low", "medium", "high"] } });

console.log("Found", tickets.length, "tickets with invalid priority");

for (let ticket of tickets) {
  const upperPriority = ticket.priority.toUpperCase();
  ticket.priority = upperPriority;
  await ticket.save();
  console.log("Updated ticket", ticket._id, "priority to", upperPriority);
}

console.log("All tickets fixed!");
process.exit();
