const {diskStorage} = require("multer");
const dateTimeService = require("../utils/dateTimeService");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// const appDirectory = (appId, version) => `${appId}/${version}`;

// Helper function to get dynamic upload path
const getUploadPath = (req) => {
    const { userId } = req;

    const routerName = req.baseUrl.replace(/^\//, ""); // Remove leading "/"
    const endpoint = req.path.replace(/^\//, "").split("?")[0]; // Remove leading "/" and query params

    const basePath = `${routerName}/${endpoint}`;
    console.log("basePath", basePath);

    let dirPath

    if (!userId) dirPath = "uploads/misc/"; // Default directory if userId is missing
    else if (basePath === 'profile/picture') dirPath = `uploads/users/${userId}/public`;
    else dirPath = `uploads/users/${userId}/not_specified`;

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
};


const storage = diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = getUploadPath(req);
        cb(null, uploadPath); // Save files in the "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, dateTimeService.now().toString() + path.extname(file.originalname));
    }
});

// if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");


// Create multer instance
const upload = multer({ storage });

module.exports = { upload };
