import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/rolesModel.js";
import { Roles, Permissions } from "../enums/rolesEnum.js";

dotenv.config();

const roles = [
  {
    name: Roles.OWNER,
    permissions: [
      Permissions.CREATE_WORKSPACE,
      Permissions.DELETE_WORKSPACE,
      Permissions.EDIT_WORKSPACE,
      Permissions.MANAGE_WORKSPACE_SETTINGS,
      Permissions.ADD_MEMBER,
      Permissions.CHANGE_MEMBER_ROLE,
      Permissions.REMOVE_MEMBER,
      Permissions.CREATE_PROJECT,
      Permissions.EDIT_PROJECT,
      Permissions.DELETE_PROJECT,
      Permissions.CREATE_TASK,
      Permissions.EDIT_TASK,
      Permissions.DELETE_TASK,
    ],
  },
  {
    name: Roles.ADMIN,
    permissions: [
      Permissions.CREATE_PROJECT,
      Permissions.EDIT_PROJECT,
      Permissions.DELETE_PROJECT,
      Permissions.CREATE_TASK,
      Permissions.EDIT_TASK,
      Permissions.DELETE_TASK,
      Permissions.ADD_MEMBER,
      Permissions.REMOVE_MEMBER,
    ],
  },
  {
    name: Roles.MEMBER,
    permissions: [
      Permissions.CREATE_TASK,
      Permissions.EDIT_TASK,
      Permissions.DELETE_TASK,
      Permissions.VIEW_ONLY,
    ],
  },
];

export const seedRoles = async (closeAfter = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected (from seeder)");
    }

    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.log(`🌱 Role "${role.name}" created`);
      } else {
        console.log(`⚡ Role "${role.name}" already exists`);
      }
    }

    console.log("✅ Seeding completed");

    if (closeAfter) {
      await mongoose.disconnect();
      console.log("🔌 MongoDB Disconnected (after seeding)");
    }
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    if (closeAfter) await mongoose.disconnect();
  }
};

// 👉 Run directly only if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRoles(true).then(() => process.exit());
}