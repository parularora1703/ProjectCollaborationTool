import mongoose from "mongoose";
import { ProviderEnum } from "../enums/accountProviderEnum.js";

const { Schema } = mongoose;

const accountSchema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      required: true,
    },
    providerId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    refreshToken: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const AccountModel = mongoose.model("Account", accountSchema);
export default AccountModel;
