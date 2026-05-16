import { Router } from "express";
import {
  UserRegisterController,
  VerifyEmailController,
  UserLoginController,
  LogoutController,
  getMe,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/tokenMiddleware.js";

 const authRouter = Router();

authRouter.post("/register", UserRegisterController);
authRouter.post("/verify-email", VerifyEmailController);
authRouter.post("/login", UserLoginController);
authRouter.post("/logout", LogoutController);
authRouter.get("/me", verifyToken, getMe);

export default authRouter 