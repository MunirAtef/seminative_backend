const storeRepo = require("./storeRepo")
const path = require("path");
const fs = require("fs");
const responses = require("../responses");

const projectBaseDir = process.cwd();

// update code to use
const storeController = {
    // GET search suggestions
    searchSuggestions: async (req, res) => {
        const term = req.query.term?.toLowerCase() || "";
        const userId = req.userId;
        const result = await storeRepo.searchSuggestions({userId, term})
        res.status(result.status).json(result);
    },

    // GET search results
    search: async (req, res) => {
        const term = req.query["term"]?.toLowerCase() || "";
        const userId = req.userId
        const result = await storeRepo.search({userId, term});
        res.status(result.status).json(result);
    },


    // GET app details
    postApp: async (req, res) => {
        const {
            name,
            description,
            iconUrl,
            minAge,
            lastVersion,
            category,
            tags
        } = req.body;

        /// name
        /// iconUrl
        /// lastVersion
        /// creatorId
        /// size
        /// downloads
        /// minAge
        /// ratings: Array (5)
        /// description

        const appId = req.params["appId"];
        const userId = req.userId;
        const result = await storeRepo.appDetails({userId, appId});
        res.status(result.status).json(result);
    },

    // GET app details
    appDetails: async (req, res) => {
        console.log(req.query);
        const appId = req.params["appId"];
        const userId = req.userId;
        console.log(appId);
        const result = await storeRepo.appDetails({userId, appId});
        res.status(result.status).json(result);
    },

    getReviews: async (req, res) => {
        const {identifier, limit} = req.query;
        const appId = req.params["appId"];

        console.log(appId, identifier, limit);

        const result = await storeRepo.getReviews({appId, identifier, limit: parseInt(limit) || 10});
        res.status(result.status).json(result);
    },

    // POST a review
    postReview: async (req, res) => {
        const {content, rate} = req.body;
        const appId = req.params["appId"];
        const userId = req.userId

        console.log(userId, content, rate);

        const result = await storeRepo.postReview({userId, appId, content, rate: parseInt(rate)});
        res.status(result.status).json(result);
    },

    // DELETE a review
    deleteReview: async (req, res) => {
        res.json({success: true, message: "Review deleted successfully"});
    },

    // PUT (edit) a review
    updateReview: async (req, res) => {
        res.json({success: true, message: "Review updated successfully"});
    },

    // GET download file (returns dummy file)
    downloadApp: async (req, res) => {
        const filename = 'base_v2.zip';
        const userId = req.userId;
        const appId = req.params.appId;
        const version = req.params.version;
        // const filePath = path.resolve(__dirname, 'files', filename);
        const filePath = path.resolve(projectBaseDir, `uploads/apps/${appId}/${version}/${filename}`);
        if (!fs.existsSync(filePath)) {
            const notFoundRes = responses.notFound("App not found");
            return res.status(notFoundRes.status).send(notFoundRes);
        }

        // Set headers
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Optional error handling
        fileStream.on('error', (err) => {
            console.error('File stream error:', err);
            res.status(500).send('Server error');
        });

        await storeRepo.downloadApp({userId, appId, version});

        console.log(__dirname);
        console.log(__filename);

        // res.sendFile(__dirname);

        // const appId = req.params.appId;
        // const filePath = path.resolve(projectBaseDir, `uploads/apps/${appId}/`);
        // const filePath = path.resolve(projectBaseDir, `uploads/apps/67becd0bed355017e8b5bd46/base.zip`);
        // res.sendFile(filePath);


        // res.json({
        //     success: true,
        //     message: "Download app"
        // });

        // res.setHeader("Content-Disposition", "attachment; filename=dummy.apk");
        // res.sendFile("../../../public/index.html");
        // res.send("Dummy file content"); // In a real scenario, use res.sendFile(path_to_file)
    },


    // history handlers
    getHistory: async (req, res) => {
        const userId = req.userId;
        const {identifier, limit} = req.query;
        const historyType = req.params.type.toUpperCase();

        const result = await storeRepo.getHistory({userId, historyType, identifier, limit: parseInt(limit) || 20});
        res.status(result.status).json(result);
    },

    deleteHistoryItem: async (req, res) => {
        const userId = req.userId;
        const itemId = req.params.id;
        const historyType = req.params.type.toUpperCase();

        const result = await storeRepo.deleteHistoryItem({userId, historyType, itemId});
        res.status(result.status).json(result);
    },
    deleteHistory: async (req, res) => {
        const userId = req.userId;
        const historyType = req.params.type.toUpperCase();

        const result = await storeRepo.deleteHistory({userId, historyType});
        res.status(result.status).json(result);
    },
}

module.exports = storeController;