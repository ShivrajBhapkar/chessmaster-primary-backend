import express from "express";
import v1Router from "./router/v1";
import cors from "cors";
import { initPassport } from "./passport";
import authRoute from "./router/auth";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import { COOKIE_MAX_AGE } from "./consts";

const app = express();

dotenv.config();
app.use(express.json());
app.use(cookieParser());
console.log("Called")
app.use(
    session({
        secret: process.env.COOKIE_SECRET || "keyboard cat",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true, maxAge: COOKIE_MAX_AGE, sameSite: "none" },
    })
);

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate("session"));

app.use(
    cors({
        origin: "http://chesspro.xyz", // Frontend URL
        credentials: true, // Allow cookies to be sent
    })
);

app.use("/auth", authRoute);
app.use("/v1", v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
