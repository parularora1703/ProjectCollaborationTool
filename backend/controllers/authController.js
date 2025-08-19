import { asyncHandler } from "../middlewares/asyncHandler.js";
import { config } from "../config/app.config.js";
import { registerSchema } from "../validation/authValidation.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { registerUserService } from "../services/authServices.js";
import passport from "passport";
import jwt from "jsonwebtoken";

//
// 🔹 Google OAuth Callback
//
export const googleLoginCallback = asyncHandler(async (req, res) => {
  const currentWorkspace = req.user?.currentWorkspace;

  if (!currentWorkspace) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
    );
  }

  // ✅ Optional: generate a JWT here too if frontend needs it
  return res.redirect(
    `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
  );
});

//
// 🔹 Register a new user
//
export const registerUserController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse({
    ...req.body,
  });

  await registerUserService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User created successfully",
  });
});

//
// 🔹 Login with Email/Password
//
export const loginController = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: info?.message || "Invalid email or password",
      });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { sub: user._id, email: user.email }, // JWT payload
      config.JWT_SECRET, // secret
      { expiresIn: "7d" } // expiry
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged in successfully",
      token, // <-- send token
      user,
    });
  })(req, res, next);
});

//
// 🔹 Logout
//
export const logOutController = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res
        .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to log out" });
    }
  });

  req.session = null;
  return res.status(HTTPSTATUS.OK).json({ message: "Logged out successfully" });
});
