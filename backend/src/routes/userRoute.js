import { Router} from "express";
const userRouter = Router();
import { getUserProfileController } from "../controller/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";

userRouter.post("/profile", protectUser, getUserProfileController);

export default userRouter