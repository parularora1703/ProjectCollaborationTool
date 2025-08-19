import { Roles } from "../enums/rolesEnum.js";
import MemberModel from "../models/memberModel.js";
import RoleModel from "../models/rolesModel.js";
import WorkspaceModel from "../models/workspaceModel.js";
import UserModel from "../models/userModel.js";
import { NotFoundException, UnauthorizedException } from "../utils/appError.js";

export const getMemberRoleInWorkspace = async (userId, workspaceId) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
    );
  }

  return { role: member.role?.name };
};

export const joinWorkspaceByInviteService = async (userId, inviteCode) => {
  // 1) Find workspace by invite code
  const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }

  // 2) Check if user is already a member
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  })
    .populate("role")
    .exec();

  if (existingMember) {
    return {
      workspaceId: workspace._id,
      role: existingMember.role?.name ?? Roles.MEMBER,
      alreadyMember: true,
    };
  }

  // 3) Get default MEMBER role
  const role = await RoleModel.findOne({ name: Roles.MEMBER }).exec();
  if (!role) {
    throw new NotFoundException("Default role not found");
  }

  // 4) Add user to workspace as a member
  try {
    const newMember = await MemberModel.create({
      userId,
      workspaceId: workspace._id,
      role: role._id,
    });

    // ✅ Update user's current workspace only if not set already
    await UserModel.findByIdAndUpdate(
      userId,
      { currentWorkspace: workspace._id },
      { new: true }
    );

    return {
      workspaceId: workspace._id,
      role: role.name,
      alreadyMember: false,
    };
  } catch (err) {
    // Handle duplicate membership (race condition)
    if (err && err.code === 11000) {
      const member = await MemberModel.findOne({
        userId,
        workspaceId: workspace._id,
      })
        .populate("role")
        .exec();

      return {
        workspaceId: workspace._id,
        role: member?.role?.name ?? Roles.MEMBER,
        alreadyMember: true,
      };
    }
    throw err;
  }
};
