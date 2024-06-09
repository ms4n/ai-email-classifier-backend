import express from "express";
import {
  googleAuth,
  googleCallback,
  logout,
  authStatus,
  getUser,
  getEmails,
} from "../controllers/authController.mjs";

const router = express.Router();

router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleCallback, (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}mails`);
});
router.get("/auth/logout", logout);
router.get("/auth/status", authStatus);
router.get("/auth/user", getUser);
router.get("/get-emails", getEmails);

export default router;
