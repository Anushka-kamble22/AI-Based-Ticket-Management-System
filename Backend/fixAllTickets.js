import mongoose from "mongoose";
import Ticket from "./models/ticket.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Get all tickets 
const allTickets = await Ticket.find({});
console.log("Total tickets:", allTickets.length);

// Check for invalid priorities
let fixedCount = 0;
for (let ticket of allTickets) {
  const validPriorities = ["LOW", "MEDIUM", "HIGH"];
  if (!validPriorities.includes(ticket.priority)) {
    console.log("Found invalid priority:", ticket._id, "priority:", ticket.priority);
    ticket.priority = ticket.priority.toUpperCase();
    await ticket.save();
    fixedCount++;
    console.log("Fixed to:", ticket.priority);
  }
}

console.log("Total fixed:", fixedCount);
process.exit();
