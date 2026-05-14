import { Router } from "express";
import {
  UserRegisterController,
  VerifyEmailController,
  UserLoginController,
  LogoutController,
} from "../controller/authController.js";

 const authRouter = Router();

authRouter.post("/register", UserRegisterController);
authRouter.post("/verify-email", VerifyEmailController);
authRouter.post("/login", UserLoginController);
authRouter.post("/logout", LogoutController);


export default authRouter 