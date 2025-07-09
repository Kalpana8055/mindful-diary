
const express = require("express");
const router = express.Router();
const Diary = require("../models/Diary");
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "No token provided" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.userId = decoded.userId;
        next();
    });
}

router.post("/", verifyToken, async (req, res) => {
    const { entry, mood } = req.body;
    try {
        const diary = new Diary({ userId: req.userId, entry, mood });
        await diary.save();
        res.json({ message: "Diary entry saved" });
    } catch (err) {
        res.status(400).json({ error: "Unable to save diary" });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const diaries = await Diary.find({ userId: req.userId }).sort({ date: -1 });
        res.json(diaries);
    } catch (err) {
        res.status(500).json({ error: "Unable to fetch diaries" });
    }
});

module.exports = router;
