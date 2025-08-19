import express from "express";
import { joinWorkspaceByInviteController } from "../controllers/memberController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Join workspace via invite code
router.post(
  "/workspace/:inviteCode/join",
  isAuthenticated,
  joinWorkspaceByInviteController
);

export default router;
