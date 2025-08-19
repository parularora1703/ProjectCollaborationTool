import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../utils/appError.js";

export const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded should contain { _id, email, ... }
    next();
  } catch (err) {
    throw new UnauthorizedException("Invalid token");
  }
};
