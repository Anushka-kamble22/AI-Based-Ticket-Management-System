import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["TODO", "IN_PROGRESS", "COMPLETED"],
    default: "TODO"
  },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },

  priorityScore: {
    type: Number,
    default: 2
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  deadline: {
    type: Date
  },

  /* AI DATA */

  aiSummary: {
    type: String,
    default: ""
  },

  helpfulNotes: {
    type: String,
    default: ""
  },

  relatedSkills: {
    type: [String],
    default: []
  }

}, {
  timestamps: true
});

/* Indexes */

ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ createdAt: -1 });

export default mongoose.model("Ticket", ticketSchema);