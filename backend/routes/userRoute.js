import { Router } from "express";
import { getCurrentUserController } from "../controllers/userController.js";

const userRoutes = Router();

// GET /api/user/current
userRoutes.get("/current", getCurrentUserController);

export default userRoutes;
