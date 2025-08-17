require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../config/database.config");
const RoleModel = require("../models/roles-permission.model");
const { RolePermissions } = require("../utils/role-permission");

const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {
    await connectDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles...");
    await RoleModel.deleteMany({}, { session });

    for (const roleName in RolePermissions) {
      const role = roleName; 
      const permissions = RolePermissions[role];

      // Check if the role already exists
      const existingRole = await RoleModel.findOne({ name: role }).session(session);
      if (!existingRole) {
        const newRole = new RoleModel({
          name: role,
          permissions: permissions,
        });
        await newRole.save({ session });
        console.log(`Role ${role} added with permissions.`);
      } else {
        console.log(`Role ${role} already exists.`);
      }
    }

    await session.commitTransaction();
    console.log("Transaction committed.");

    session.endSession();
    console.log("Session ended.");

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
};

seedRoles().catch((error) => console.error("Error running seed script:", error));
