"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const uuid_1 = require("uuid");
const consts_1 = require("../consts");
const router = (0, express_1.Router)();
const CLIENT_URL = (_a = process.env.AUTH_REDIRECT_URL) !== null && _a !== void 0 ? _a : "http://chesspro.xyz/game/random";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// this route is to be hit when the user wants to login as a guest
router.post("/guest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bodyData = req.body;
    let guestUUID = "guest-" + (0, uuid_1.v4)();
    const user = yield db_1.db.user.create({
        data: {
            username: guestUUID,
            email: guestUUID + "@chess100x.com",
            name: bodyData.name || guestUUID,
            provider: "GUEST",
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, name: user.name, isGuest: true }, JWT_SECRET);
    const UserDetails = {
        id: user.id,
        name: user.name,
        token: token,
        isGuest: true,
    };
    res.cookie("guest", token, { maxAge: consts_1.COOKIE_MAX_AGE });
    res.json(UserDetails);
}));
router.get("/refresh", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const user = req.user;
        // Token is issued so it can be shared b/w HTTP and ws server
        // Todo: Make this temporary and add refresh logic here
        const userDb = yield db_1.db.user.findFirst({
            where: {
                id: user.id,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, name: userDb === null || userDb === void 0 ? void 0 : userDb.name }, JWT_SECRET);
        res.json({
            token,
            id: user.id,
            name: userDb === null || userDb === void 0 ? void 0 : userDb.name,
        });
    }
    else if (req.cookies && req.cookies.guest) {
        const decoded = jsonwebtoken_1.default.verify(req.cookies.guest, JWT_SECRET);
        const token = jsonwebtoken_1.default.sign({ userId: decoded.userId, name: decoded.name, isGuest: true }, JWT_SECRET);
        let User = {
            id: decoded.userId,
            name: decoded.name,
            token: token,
            isGuest: true,
        };
        res.cookie("guest", token, { maxAge: consts_1.COOKIE_MAX_AGE });
        res.json(User);
    }
    else {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
}));
router.get("/login/failed", (req, res) => {
    res.status(401).json({ success: false, message: "failure" });
});
router.get("/logout", (req, res) => {
    res.clearCookie("guest");
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            res.status(500).json({ error: "Failed to log out" });
        }
        else {
            res.clearCookie("jwt");
            res.redirect("http://localhost:5173/");
        }
    });
});
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
}));
router.get("/github", passport_1.default.authenticate("github", { scope: ["read:user", "user:email"] }));
router.get("/github/callback", passport_1.default.authenticate("github", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
}));
exports.default = router;
