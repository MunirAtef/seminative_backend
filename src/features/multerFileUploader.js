// const {diskStorage} = require("multer");
// const dateTimeService = require("../utils/dateTimeService");
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");
//
// const appDirectory = (appId, version) => `${appId}/${version}`;
//
// // Helper function to get dynamic upload path
// const getUploadPath = (req) => {
//     const { userId } = req;
//
//     const routerName = req.baseUrl.replace(/^\//, ""); // Remove leading "/"
//     const endpoint = req.path.replace(/^\//, "").split("?")[0]; // Remove leading "/" and query params
//
//     const basePath = `${routerName}/${endpoint}`;
//     console.log("basePath", basePath);
//
//     let dirPath
//
//     if (!userId) dirPath = "uploads/misc/"; // Default directory if userId is missing
//     else if (basePath === 'profile/picture') dirPath = `uploads/users/${userId}/public`;
//     else dirPath = `uploads/users/${userId}/not_specified`;
//
//     // Ensure directory exists
//     if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
//     return dirPath;
// };
//
//
// const storage = diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = getUploadPath(req);
//         cb(null, uploadPath); // Save files in the "uploads" directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, dateTimeService.now().toString() + path.extname(file.originalname));
//     }
// });
//
// // if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
//
//
// // Create multer instance
// const upload = multer({ storage });
//
// module.exports = { upload };


// ==============================================================


// import express from 'express';
// import multer from 'multer';
// import { v2 as cloudinary } from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
//
// // Configure Cloudinary
// cloudinary.config({
//     cloud_name: 'dyo1wxvoc',
//     api_key: '556374454877768',
//     api_secret: 'gWH6RU00NCyU52fLZtIj8m8Ygs4'
// });
//
// // Set up multer storage to use Cloudinary
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'uploads', // Optional: folder name in Cloudinary
//         format: async (req, file) => 'png', // Convert all images to PNG
//         public_id: (req, file) => file.originalname.split('.')[0] // Use original name (without extension) as public ID
//     }
// });
//
// // Initialize multer
// const upload = multer({ storage });
// module.exports = { upload };


// =============================

import express from 'express';
import multer from 'multer';
const cloudinary = require('cloudinary').v2;
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temp storage for file

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dyo1wxvoc',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'uploads', // Optional folder in Cloudinary
        });

        // Delete the temporary file
        fs.unlinkSync(req.file.path);

        res.json({ message: 'File uploaded successfully', fileUrl: result.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
