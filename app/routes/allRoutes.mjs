import express from "express";
import {
  googleAuth,
  googleCallback,
  logout,
  authStatus,
  getUser,
  getEmails,
} from "../controllers/authController.mjs";

import { classifyEmails } from "../controllers/emailClassifyController.mjs";

const router = express.Router();

router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleCallback, (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/emails`);
});
router.get("/auth/logout", logout);
router.get("/auth/status", authStatus);
router.get("/auth/user", getUser);
router.get("/get-emails", getEmails);

router.post("/classify-emails", classifyEmails);

export default router;
