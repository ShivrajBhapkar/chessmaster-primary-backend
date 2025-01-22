"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const v1Router = (0, express_1.Router)();
v1Router.get('/', (req, res) => {
    res.send('Hello, World!');
});
exports.default = v1Router;
