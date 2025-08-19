import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import AccountModel from "../models/accountModel.js";
import WorkspaceModel from "../models/workspaceModel.js";
import RoleModel from "../models/rolesModel.js";
import { Roles } from "../enums/rolesEnum.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError.js";
import MemberModel from "../models/memberModel.js";
import { ProviderEnum } from "../enums/accountProviderEnum.js";

//
// Utility: Generate JWT
//
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

//
// 🔹 Login or create account (Google, Github, etc.)
//
export const loginOrCreateAccountService = async (data) => {
  const { providerId, provider, displayName, email, picture } = data;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      // Create a new user if it doesn't exist
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider,
        providerId,
      });
      await account.save({ session });

      // Create workspace
      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id;
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(user);

    return { user: user.omitPassword(), token };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

//
// 🔹 Register a new user with email/password
//
export const registerUserService = async (body) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = new UserModel({ email, name, password });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    const workspace = new WorkspaceModel({
      name: `My Workspace`,
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({
      name: Roles.OWNER,
    }).session(session);

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });

    user.currentWorkspace = workspace._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    const token = generateToken(user);

    return { user: user.omitPassword(), token };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//
// 🔹 Verify user login with email/password
//
export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Invalid email or password");
  }

  const user = await UserModel.findById(account.userId).select("+password");
  if (!user) {
    throw new NotFoundException("User not found for the given account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

  return { user: user.omitPassword(), token };
};
