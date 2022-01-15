import { Router } from "express";
import groupController from "../controllers/group.controller.js";
import { decode } from "../middleware/jwt.js";

export const groupRoutes = Router();

groupRoutes.post("/create-group", decode, groupController.create_group);

groupRoutes.get("/all-groups", decode, groupController.get_joined_groups);

groupRoutes.get("/pending-groups", decode, groupController.get_pending_groups);

groupRoutes.get("/joined/:groupId", decode, groupController.get_group);

groupRoutes.get("/:groupId", decode, groupController.get_single_group);

groupRoutes.put("/:groupId", decode, groupController.update_group);

groupRoutes.put("/invite/:groupId", decode, groupController.invite_member);

groupRoutes.put(
  "/add-moderator/:groupId",
  decode,
  groupController.add_moderator
);

groupRoutes.put("/add-admin/:groupId", decode, groupController.add_admin);

groupRoutes.put(
  "/accept-invite/:groupId",
  decode,
  groupController.accept_group_invite
);

groupRoutes.put(
  "/remove-member/:groupId",
  decode,
  groupController.remove_member
);

groupRoutes.put(
  "/remove-moderator/:groupId",
  decode,
  groupController.remove_moderator
);

groupRoutes.put("/remove-admin/:groupId", decode, groupController.remove_admin);
