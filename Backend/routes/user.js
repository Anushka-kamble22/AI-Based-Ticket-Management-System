import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";
import { allowRoles } from "../middlewares/role.js";
import User from "../models/user.js";

const router = express.Router();

/* =========================
   NORMAL USER ROUTES
========================= */

// Update own profile
router.post("/update-user", authenticate, updateUser);

// Only Admin can get all users
router.get("/users", authenticate, allowRoles("admin"), getUsers);

/* =========================
   ADMIN MANAGEMENT ROUTES
========================= */

// 🔥 Admin → Get all users (detailed)
router.get(
  "/admin/all",
  authenticate,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// 🔥 Admin → Change user role
router.put(
  "/admin/:id/role",
  authenticate,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["user", "moderator", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update role" });
    }
  }
);

/* =========================
   AUTH ROUTES (PUBLIC)
========================= */

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;