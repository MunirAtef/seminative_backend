const express = require('express');
const controller = require('./profileController');
const {upload} = require("../multerFileUploader");
const authMiddleware = require('../../utils/authMiddleware');

const router = express.Router();

router.get("/", authMiddleware, controller.getProfile);
router.put("/name", authMiddleware, controller.updateName);

// without auth
router.get("/picture/:userId/:filename", controller.getProfilePicture);
router.put("/picture", authMiddleware, upload.single("file"), controller.updateProfilePicture);
router.delete("/picture", authMiddleware, controller.deleteProfilePicture);

router.put("/password", authMiddleware, controller.updatePassword);


module.exports = router;

