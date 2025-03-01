const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const projectBaseDir = process.cwd();

router.get("/profile/:userId/:filename", async (req, res) => {
    const { userId, filename } = req.params;
    const filePath = path.resolve(projectBaseDir, `uploads/users/${userId}/public/${filename}`);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

module.exports = router;
