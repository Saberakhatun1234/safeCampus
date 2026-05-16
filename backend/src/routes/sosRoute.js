import express from "express";

import { protectUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { createSOS, getAllSOS, updateSOSStatus } from "../controller/sosController.js";

const router = express.Router();

// Student triggers SOS
router.post("/createSOS", protectUser, createSOS);

// Admin/Security fetch alerts
router.get("/getAllSOS", protectUser, authorizeRoles("admin", "security"), getAllSOS);

// Admin updates status
router.put(
  "/:id",
  protectUser,
  authorizeRoles("admin", "security"),
  updateSOSStatus,
);

export default router;
