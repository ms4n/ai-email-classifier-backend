import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";

import sessionMiddleware from "./config/session.mjs";
import passport from "./config/passport.mjs";
import allRoutes from "./app/routes/allRoutes.mjs";

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

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(allRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Server is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
