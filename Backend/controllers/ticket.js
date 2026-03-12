import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

/* =========================
   CREATE TICKET
========================= */

export const createTicket = async (req, res) => {
  try {

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
      status: "TODO"
    });

    /* Trigger AI workflow */

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    /* 🔥 Real-time event */

    const io = req.app.get("io");
    if (io) {
      io.emit("ticketCreated", newTicket);
    }

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });

  } catch (error) {

    console.error("Create ticket error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });

  }
};


/* =========================
   GET ALL TICKETS
========================= */

export const getTickets = async (req, res) => {
  try {

    const user = req.user;
    let tickets;

    if (user.role === "admin" || user.role === "moderator") {

      tickets = await Ticket.find()
        .populate("createdBy", "email role")
        .populate("assignedTo", "email role")
        .sort({ createdAt: -1 });

    } else {

      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", "email")
        .select("title description status priority assignedTo createdAt")
        .sort({ createdAt: -1 });

    }

    return res.status(200).json(tickets);

  } catch (error) {

    console.error("Fetch tickets error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });

  }
};


/* =========================
   GET SINGLE TICKET
========================= */

export const getTicket = async (req, res) => {
  try {

    const user = req.user;
    let ticket;

    if (user.role === "admin" || user.role === "moderator") {

      ticket = await Ticket.findById(req.params.id)
        .populate("createdBy", "email role")
        .populate("assignedTo", "email role");

    } else {

      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      }).select(
        "title description status priority createdAt aiSummary helpfulNotes relatedSkills assignedTo"
      );

    }

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    return res.status(200).json(ticket);

  } catch (error) {

    console.error("Fetch ticket error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });

  }
};



/* =========================
   ADMIN: ASSIGN MODERATOR
========================= */

export const assignModerator = async (req, res) => {
  try {

    const { moderatorId } = req.body;

    if (!moderatorId) {
      return res.status(400).json({
        message: "Moderator ID is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    ticket.assignedTo = moderatorId;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "email role")
      .populate("assignedTo", "email role");

    /* 🔥 Real-time update */

    const io = req.app.get("io");
    if (io) {
      io.emit("ticketUpdated", updatedTicket);
    }

    return res.status(200).json({
      message: "Moderator assigned successfully",
      ticket: updatedTicket,
    });

  } catch (error) {

    console.error("Assign moderator error:", error);

    return res.status(500).json({
      message: "Assignment failed",
    });

  }
};


/* =========================
   ADMIN: UPDATE STATUS
========================= */

export const updateTicketStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const validStatus = ["TODO", "IN_PROGRESS", "COMPLETED"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("createdBy", "email")
      .populate("assignedTo", "email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    /* 🔥 Real-time update */

    const io = req.app.get("io");
    if (io) {
      io.emit("ticketUpdated", ticket);
    }

    return res.status(200).json({
      message: "Status updated successfully",
      ticket,
    });

  } catch (error) {

    console.error("Update status error:", error);

    return res.status(500).json({
      message: "Status update failed",
    });

  }
};


/* =========================
   ADMIN: DELETE TICKET
========================= */

export const deleteTicket = async (req, res) => {
  try {

    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    /* 🔥 Real-time delete */

    const io = req.app.get("io");
    if (io) {
      io.emit("ticketDeleted", req.params.id);
    }

    return res.status(200).json({
      message: "Ticket deleted successfully",
    });

  } catch (error) {

    console.error("Delete ticket error:", error);

    return res.status(500).json({
      message: "Delete failed",
    });

  }
};
export const searchTickets = async (req, res) => {

  const { q } = req.query;

  const tickets = await Ticket.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    ]
  });

  res.json(tickets);
};
export const filterTickets = async (req, res) => {

  const { status, priority } = req.query;

  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tickets = await Ticket.find(query);

  res.json(tickets);
};