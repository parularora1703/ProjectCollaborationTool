import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import { config } from "./app.config.js";
import { NotFoundException } from "../utils/appError.js";
import { ProviderEnum } from "../enums/accountProviderEnum.js";
import {
  loginOrCreateAccountService,
  verifyUserService,
} from "../services/authServices.js";
import UserModel from "../models/userModel.js";

//
// 🔹 Google OAuth Strategy (session-based)
//
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const { email, sub: googleId, picture } = profile._json;

        if (!googleId) {
          throw new NotFoundException("Google ID (sub) is missing");
        }

        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName,
          providerId: googleId,
          picture,
          email,
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

//
// 🔹 Local Strategy (Email + Password, no session)
//
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false, // ✅ disable session for local strategy
    },
    async (email, password, done) => {
      try {
        const user = await verifyUserService({ email, password });
        return done(null, user);
      } catch (error) {
        return done(error, false, { message: error?.message });
      }
    }
  )
);

//
// 🔹 JWT Strategy (stateless auth)
//
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        // We set "sub" when signing the JWT -> { sub: user._id }
        const user = await UserModel.findById(jwtPayload.sub).select("-password");

        if (!user) return done(null, false);

        return done(null, user); // attach user to req.user
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

//
// 🔹 Serialize / Deserialize (only for Google OAuth session)
//
passport.serializeUser((user, done) => {
  done(null, user.id); // store just user id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
