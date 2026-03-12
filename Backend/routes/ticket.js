import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { allowRoles } from "../middlewares/role.js";
import {
  createTicket,
  getTicket,
  getTickets,
  searchTickets,
  filterTickets
} from "../controllers/ticket.js";
import Ticket from "../models/ticket.js";
import User from "../models/user.js";

const router = express.Router();

/* =========================
   NORMAL USER ROUTES
========================= */

router.get("/", authenticate, getTickets);
router.get("/search", authenticate, searchTickets);
router.get("/filter", authenticate, filterTickets);
router.post("/", authenticate, async (req, res, next) => {
  try {

    const ticket = await createTicket(req, res);

    const io = req.app.get("io");

    if (io) {
      io.emit("ticketCreated");
    }

  } catch (err) {
    next(err);
  }
});


/* =========================
   ADMIN ROUTES
========================= */

/* -------- Admin → Dashboard stats (MUST BE FIRST) -------- */

router.get(
  "/admin/stats",
  authenticate,
  allowRoles("admin"),
  async (req, res) => {
    try {

      const totalTickets = await Ticket.countDocuments();

      const completed = await Ticket.countDocuments({
        status: "COMPLETED",
      });

      const inProgress = await Ticket.countDocuments({
        status: "IN_PROGRESS",
      });

      const pending = await Ticket.countDocuments({
        status: "TODO",
      });

      const totalUsers = await User.countDocuments();

      res.json({
        totalTickets,
        completed,
        inProgress,
        pending,
        totalUsers,
      });

    } catch (err) {

      console.error("Stats fetch error:", err);

      res.status(500).json({
        error: "Failed to fetch dashboard stats",
      });

    }
  }
);

/* -------- Admin → Get all tickets -------- */

router.get(
  "/admin/all",
  authenticate,
  allowRoles("admin"),
  async (req, res) => {
    try {

      const tickets = await Ticket.find()
        .populate("createdBy", "email role")
        .populate("assignedTo", "email role")
        .sort({ createdAt: -1 });

      res.json(tickets);

    } catch (err) {

      console.error("Admin all tickets error:", err);

      res.status(500).json({
        error: "Failed to fetch all tickets",
      });

    }
  }
);


/* -------- Admin + Moderator → Update ticket status -------- */

router.put(
  "/admin/:id/status",
  authenticate,
  allowRoles("admin", "moderator"),
  async (req, res) => {
    try {

      const { status } = req.body;

      if (!["TODO", "IN_PROGRESS", "COMPLETED"].includes(status)) {
        return res.status(400).json({
          error: "Invalid status value",
        });
      }

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      ticket.status = status;
      
      const savedTicket = await ticket.save();

      const updatedTicket = await Ticket.findById(savedTicket._id)
        .populate("createdBy", "email role")
        .populate("assignedTo", "email role");

      const io = req.app.get("io");
      if (io) {
        io.emit("ticketUpdated", updatedTicket);
      }

      res.json(updatedTicket);

    } catch (err) {

      console.error("Status update error:", err);

      res.status(500).json({
        error: "Failed to update ticket status",
        details: err.message
      });

    }
  }
);


/* -------- Admin → Assign moderator -------- */

router.put(
  "/admin/:id/assign",
  authenticate,
  allowRoles("admin"),
  async (req, res) => {
    try {

      const { moderatorId } = req.body;

      if (!moderatorId) {
        return res.status(400).json({
          error: "Moderator ID required"
        });
      }

      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found"
        });
      }

      const moderator = await User.findById(moderatorId);

      if (!moderator || moderator.role !== "moderator") {
        return res.status(400).json({
          error: "Invalid moderator"
        });
      }

      ticket.assignedTo = moderatorId;
      await ticket.save();

      const updatedTicket = await Ticket.findById(ticket._id)
        .populate("createdBy", "email role")
        .populate("assignedTo", "email role");

      const io = req.app.get("io");
      if (io) {
        io.emit("ticketUpdated", updatedTicket);
      }

      res.json(updatedTicket);

    } catch (err) {

      console.error("Assign moderator error:", err);

      res.status(500).json({
        error: "Failed to assign moderator",
        details: err.message
      });

    }
  }
);


/* -------- Admin → Delete ticket -------- */

router.delete(
  "/admin/:id",
  authenticate,
  allowRoles("admin"),
  async (req, res) => {
    try {

      const ticket = await Ticket.findByIdAndDelete(req.params.id);

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
        });
      }

      const io = req.app.get("io");
      if (io) {
        io.emit("ticketDeleted", req.params.id);
      }

      res.json({
        message: "Ticket deleted successfully",
      });

    } catch (err) {

      console.error("Delete ticket error:", err);

      res.status(500).json({
        error: "Failed to delete ticket",
        details: err.message
      });

    }
  }
);

/* -------- Moderator → Get assigned tickets -------- */

router.get(
  "/moderator/my-tickets",
  authenticate,
  allowRoles("moderator"),
  async (req, res) => {
    try {

      const tickets = await Ticket.find({
        assignedTo: req.user.id
      })
        .populate("createdBy", "email")
        .populate("assignedTo", "email")
        .sort({ createdAt: -1 });

      res.json(tickets);

    } catch (err) {

      console.error("Moderator tickets error:", err);

      res.status(500).json({
        error: "Failed to fetch moderator tickets"
      });

    }
  }
);


/* =========================
   SINGLE TICKET (KEEP LAST)
========================= */

router.get("/:id", authenticate, getTicket);


export default router;