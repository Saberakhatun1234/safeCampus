import { Router } from "express";
import {
  UserRegisterController,
  VerifyEmailController,
  UserLoginController,
  LogoutController,
  getMe,
  addSecurityController
} from "../controller/authController.js";
import { verifyToken } from "../middleware/tokenMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
 const authRouter = Router();

authRouter.post("/register", UserRegisterController);
authRouter.post("/verify-email", VerifyEmailController);
authRouter.post("/login", UserLoginController);
authRouter.post("/logout", LogoutController);
authRouter.get("/me", verifyToken, getMe);
authRouter.post(
  "/security/add",
  verifyToken,
  authorizeRoles("admin"),
  addSecurityController,
);
export default authRouter 