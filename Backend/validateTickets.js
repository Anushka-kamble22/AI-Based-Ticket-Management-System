import mongoose from "mongoose";
import Ticket from "./models/ticket.js";
import User from "./models/user.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log("=== TICKET DATA VALIDATION & FIX ===\n");

// Get all tickets
const allTickets = await Ticket.find({});
console.log("Total tickets found:", allTickets.length);

// Get admin user as fallback
const admin = await User.findOne({ role: "admin" });

let fixedCount = 0;
let issues = [];

for (let ticket of allTickets) {
  let wasFixed = false;

  // Check title
  if (!ticket.title || ticket.title.trim() === "") {
    ticket.title = "Untitled Ticket";
    wasFixed = true;
  }

  // Check description
  if (!ticket.description || ticket.description.trim() === "") {
    ticket.description = "No description provided";
    wasFixed = true;
  }

  // Check status
  const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
  if (!validStatuses.includes(ticket.status)) {
    console.log("Invalid status:", ticket._id, "status:", ticket.status);
    ticket.status = "TODO";
    wasFixed = true;
  }

  // Check priority
  const validPriorities = ["LOW", "MEDIUM", "HIGH"];
  if (!validPriorities.includes(ticket.priority)) {
    console.log("Invalid priority:", ticket._id, "priority:", ticket.priority);
    ticket.priority = "MEDIUM";
    wasFixed = true;
  }

  // Check createdBy (required field)
  if (!ticket.createdBy) {
    console.log("Missing createdBy:", ticket._id);
    ticket.createdBy = admin ? admin._id : null;
    wasFixed = true;
  }

  // Check priorityScore
  if (!ticket.priorityScore) {
    ticket.priorityScore = 2;
    wasFixed = true;
  }

  // Ensure arrays/strings have defaults
  if (!ticket.aiSummary) ticket.aiSummary = "";
  if (!ticket.helpfulNotes) ticket.helpfulNotes = "";
  if (!ticket.relatedSkills) ticket.relatedSkills = [];

  if (wasFixed) {
    try {
      await ticket.save();
      fixedCount++;
      console.log(" Fixed ticket:", ticket._id);
    } catch (err) {
      console.log(" Error saving ticket:", ticket._id, err.message);
      issues.push({ ticketId: ticket._id, error: err.message });
    }
  }
}

console.log("\n=== SUMMARY ===");
console.log("Total fixed:", fixedCount);
if (issues.length > 0) {
  console.log("Issues found:", issues.length);
  issues.forEach(issue => console.log("  -", issue.ticketId, ":", issue.error));
}

process.exit();
