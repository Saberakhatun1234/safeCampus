
import express from "express";
import { protectUser } from "../middleware/authMiddleware.js";
import { authorizeRoles} from "../middleware/roleMiddleware.js";
import {
  ReportController,
  GetAllIncidentsController,
  GetIncidentByIdController,
  UpdateIncidentStatusController,
  DeleteIncidentController,
} from "../controller/reportController.js";

const router = express.Router();

router.post("/reportCreated", protectUser, ReportController); // student + admin
router.get("/", protectUser, GetAllIncidentsController); // student sees own, admin sees all
router.get("/:id", protectUser, GetIncidentByIdController); // student sees own, admin sees all
router.patch("/:id/status", protectUser, authorizeRoles("admin"), UpdateIncidentStatusController); // admin only
router.delete("/:id", protectUser, authorizeRoles("admin"), DeleteIncidentController); // admin only

export default router;
