
const express = require("express");

const controller = require("./storeController");
const router = express.Router();


router.get("/search_suggestions", controller.searchSuggestions);
router.get("/search", controller.search);
router.get("/app/:appId", controller.appDetails);

router.get("/app/:appId/reviews", controller.getReviews);
router.post("/app/:appId/reviews", controller.postReview);
router.delete("/app/:appId/reviews/:reviewId", controller.deleteReview);
router.put("/app/:appId/reviews/:reviewId", controller.updateReview);

router.get("/app/:appId/download", controller.downloadApp);

// history
router.get("/history/:type", controller.getHistory);
router.delete("/history/:type/:id", controller.deleteHistoryItem);
router.delete("/history/:type", controller.deleteHistory);


module.exports = router;
