import asyncHandler from "express-async-handler";
import {
  joinWorkspaceByInviteService,
} from "../services/memberServices.js";
import UserModel from "../models/userModel.js";

// ✅ Join workspace with invite code
export const joinWorkspaceByInviteController = asyncHandler(async (req, res) => {
  const { inviteCode } = req.params;
  const userId = req.user._id; // logged-in user from JWT

  const result = await joinWorkspaceByInviteService(userId, inviteCode);

  // ✅ update user's currentWorkspace
  await UserModel.findByIdAndUpdate(userId, {
    currentWorkspace: result.workspaceID,
  });

  res.status(200).json(result);
});
