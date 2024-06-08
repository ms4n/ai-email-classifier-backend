import session from "express-session";
import RedisStore from "connect-redis";
import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 58 * 60 * 1000, // 58 minutes
  },
});

export default sessionMiddleware;
