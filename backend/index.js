import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config.js";
import connectDatabase from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandlerMiddleware.js";
import { HTTPSTATUS } from "./config/http.config.js";
import passport from "passport";
import { asyncHandler } from "./middlewares/asyncHandler.js";
import { BadRequestException } from "./utils/appError.js";
import { ErrorCodeEnum } from "./enums/errorCodeEnum.js";

import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoutes.js";


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

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  `/`,
  asyncHandler(async (req, res, next) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Everything is working fine 🚀",
    });
  })
);

app.use(`${BASE_PATH}/user`, userRoutes);
app.use(`${BASE_PATH}/auth`, authRoutes);


app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
