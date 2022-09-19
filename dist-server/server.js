"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
app.use(function (_, res, next) {
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use(express_1.default.static("dist"));
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log("Server listening on port ".concat(PORT, "..."));
});
exports.default = app;
