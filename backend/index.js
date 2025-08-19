import { seedRoles } from "./seeders/role.seeder.js";  
import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config.js";
import connectDatabase from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { HTTPSTATUS } from "./config/http.config.js";
import { asyncHandler } from "./middlewares/asyncHandler.js";
import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";  // ✅ added
import { jwtAuth } from "./middlewares/jwtAuth.js";
import isAuthenticated from "./middlewares/isAuthenticated.js";

// ✅ Import passport setup (this registers Local & Google strategies)
import passport from "./config/passport.config.js";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

// ✅ Initialize passport (after importing your config)
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Health check route
app.get(
  `/`,
  asyncHandler(async (req, res) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Everything is working fine 🚀",
    });
  })
);

// API routes
app.use(`${BASE_PATH}/user`, userRoutes);
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/members`, memberRoutes);   // ✅ added
app.use("/api/members", jwtAuth, isAuthenticated, memberRoutes);

// Error handler
app.use(errorHandler);

// Server
app.listen(config.PORT, async () => {
  console.log(`🚀 Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
  await seedRoles();   // ✅ seed roles at startup
});
