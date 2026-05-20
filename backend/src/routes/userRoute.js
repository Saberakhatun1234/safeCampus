import { Router} from "express";
const userRouter = Router();
import {
  getUserProfileController,
  getAllStudentsController,
  deleteStudentController,
  getAllSecurityController,
  toggleSecurityStatusController,
  deleteSecurityController,
 
} from "../controller/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";

userRouter.post("/profile", protectUser, getUserProfileController);
import express from "express";
import { addSecurityController } from "../controller/authController.js";



const router = express.Router();

// Only admin can access this
router.get("/students",protectUser, getAllStudentsController);
router.delete("/students/:id", protectUser, deleteStudentController);




router.get("/security",protectUser, getAllSecurityController);
router.patch(
  "/security/:id/status",
  protectUser,
  toggleSecurityStatusController,
);
router.delete("/security/:id",protectUser, deleteSecurityController);
router.post("/add/security", protectUser, addSecurityController);

export default router;

