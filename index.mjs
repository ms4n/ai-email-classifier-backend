import express, { json } from "express";
import session from "express-session";
import cors from "cors";

import { Redis } from "ioredis";
import RedisStore from "connect-redis";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

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
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
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

const gmail = google.gmail("v1");
async function fetchOneEmail(accessToken, maxResults = 15) {
  try {
    const authClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    authClient.setCredentials({
      access_token: accessToken,
    });

    const res = await gmail.users.messages.list({
      auth: authClient,
      userId: "me",
      q: "category:primary",
      maxResults: maxResults,
    });

    if (!res.data.messages || res.data.messages.length === 0) {
      throw new Error("No emails found in inbox");
    }

    const messageId = res.data.messages[14].id;

    const detailRes = await gmail.users.messages.get({
      auth: authClient,
      userId: "me",
      id: messageId,
    });

    return detailRes;
  } catch (error) {
    console.error("Error fetching email:", error);
    throw error;
  }
}

app.get("/get-emails", async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const accessToken = req.user.accessToken;

    const emails = await fetchOneEmail(accessToken);
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "An error occurred while fetching emails." });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
