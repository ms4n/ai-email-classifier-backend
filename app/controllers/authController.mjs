import passport from "passport";
import { fetchOneEmail } from "../services/emailService.mjs";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
  accessType: "offline",
});

export const googleCallback = passport.authenticate("google", {
  failureRedirect: "http://localhost:3000/",
});

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ success: true });
  });
};

export const authStatus = (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(200).json({ authenticated: false });
  }
};

export const getUser = (req, res) => {
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
};

export const protectedRoute = (req, res) => {
  if (req.isAuthenticated()) {
    res.send("This is a protected route");
  } else {
    res.redirect("/auth/google");
  }
};

export const getEmails = async (req, res) => {
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
};
