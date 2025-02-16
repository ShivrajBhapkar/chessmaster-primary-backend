"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const v1_1 = __importDefault(require("./router/v1"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = require("./passport");
const auth_1 = __importDefault(require("./router/auth"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const passport_2 = __importDefault(require("passport"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const consts_1 = require("./consts");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
console.log("Called");
app.use((0, express_session_1.default)({
    secret: process.env.COOKIE_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: consts_1.COOKIE_MAX_AGE, sameSite: "none" },
}));
(0, passport_1.initPassport)();
app.use(passport_2.default.initialize());
app.use(passport_2.default.authenticate("session"));
app.use((0, cors_1.default)({
    origin: "http://chesspro.xyz", // Frontend URL
    credentials: true, // Allow cookies to be sent
}));
app.use("/auth", auth_1.default);
app.use("/v1", v1_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
