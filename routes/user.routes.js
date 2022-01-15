import { Router } from "express";
import followController from "../controllers/follow.controller.js";
import userController from "../controllers/user.controller.js";
import { fileUpload } from "../middleware/file-upload.js";
import { decode } from "../middleware/jwt.js";

export const userRoutes = Router();

userRoutes.post("/signup", fileUpload.single('user_image'), userController.signup);

userRoutes.post("/login", userController.login);

userRoutes.post("/reset-password", userController.askResetPassword);

userRoutes.post(
  "/reset-password/:userId/:tokenId",
  userController.resetPassword
);

userRoutes.put("/update-profile", decode, userController.update_profile);

userRoutes.put("/update-password", decode, userController.update_password);

userRoutes.patch("/follow/:userId", decode, followController.follow_user);

userRoutes.patch("/unfollow/:userId", decode, followController.unfollow_user);
