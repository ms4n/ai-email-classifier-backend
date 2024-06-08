import express, { json } from "express";
import session from "express-session";
import cors from "cors";

import { Redis } from "ioredis";
import RedisStore from "connect-redis";

import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const redisClient = new Redis(process.env.REDIS_URL);

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 58 * 60 * 1000, // 58 minutes
    },
  })
);

// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        accessToken,
        refreshToken,
        profile,
      };

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    accessType: "offline",
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/",
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/emails");
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ success: true });
  });
});

// Check authentication status
app.get("/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

app.get("/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    const { name, email, picture } = req.user.profile._json;
    res.status(200).json({
      authenticated: true,
      user: {
        name,
        email,
        picture,
      },
    });
  } else {
    res.status(200).json({ authenticated: false });
  }
});

app.get("/protected", (req, res) => {
  if (req.isAuthenticated()) {
    res.send("This is a protected route");
  } else {
    res.redirect("/auth/google");
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
