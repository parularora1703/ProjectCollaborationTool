import mongoose from "mongoose";
import { config } from "./app.config.js";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to Mongo database");
  } catch (error) {
    console.error("Error connecting to Mongo database", error);
    process.exit(1);
  }
};

export default connectDatabase;