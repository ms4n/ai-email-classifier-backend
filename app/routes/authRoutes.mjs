import express from "express";
import {
  googleAuth,
  googleCallback,
  logout,
  authStatus,
  getUser,
  protectedRoute,
  getEmails,
} from "../controllers/authController.mjs";

const router = express.Router();

router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleCallback, (req, res) => {
  res.redirect("http://localhost:3000/emails");
});
router.get("/auth/logout", logout);
router.get("/auth/status", authStatus);
router.get("/auth/user", getUser);
router.get("/protected", protectedRoute);
router.get("/get-emails", getEmails);

export default router;
