const profileRepo = require('./profileRepo')
const {responses} = require("../responses");
const path = require("path");
const fs = require("fs");

const projectBaseDir = process.cwd();

const profileController = {
    getProfile: async (req, res) => {
        const userId = req.userId;
        const result = await profileRepo.getProfile({userId});
        res.status(result.status).json(result);
    },

    updateName: async (req, res) => {
        const userId = req.userId;
        const {name} = req.body;
        const result = await profileRepo.updateName({userId, name});
        res.status(result.status).json(result);
    },

    getProfilePicture: async (req, res) => {
        const { userId, filename } = req.params;
        const filePath = path.resolve(projectBaseDir, `uploads/users/${userId}/public/${filename}`);

        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: "File not found" });
        }
    },

    updateProfilePicture: async (req, res) => {
        const userId = req.userId;
        if (!req.file) {
            const result = responses.notFound("No file uploaded.");
            return res.status(result.status).send(result);
        }
        const filename = req.file.filename;
        const savingResult = await profileRepo.changeProfilePicture({userId, filename});
        res.status(savingResult.status).send(savingResult);
    },

    deleteProfilePicture: async (req, res) => {
        const userId = req.userId;
        const savingResult = await profileRepo.changeProfilePicture({userId, filename: null});
        res.status(savingResult.status).send(savingResult);
    },

    updatePassword: async (req, res) => {
        const userId = req.userId;
        const {oldPassword, newPassword} = req.body;
        const result = await profileRepo.updatePassword({userId, oldPassword, newPassword});
        res.status(result.status).json(result);
    },
};


module.exports = profileController;
