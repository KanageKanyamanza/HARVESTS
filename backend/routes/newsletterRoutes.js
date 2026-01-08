const express = require("express");
const newsletterController = require("../controllers/newsletterController");
const authMiddleware = require("../controllers/auth/authMiddleware");
const adminAuthController = require("../controllers/adminAuthController");

const router = express.Router();

// Public routes
router.post("/subscribe", newsletterController.subscribe);
router.get("/unsubscribe", newsletterController.unsubscribe);
router.get("/track/:id/:subscriberId", newsletterController.trackOpen);

// Admin routes (Protected)
router.use(adminAuthController.protect); // Use admin specific protect if available, or just authMiddleware.protect + restrictTo
// Looking at adminRoutes.js, it uses adminAuthController.protect. I will use that.

router.get("/subscribers", newsletterController.getAllSubscribers);

router
	.route("/")
	.get(newsletterController.getAllNewsletters)
	.post(newsletterController.createNewsletter);

router
	.route("/:id")
	.patch(newsletterController.updateNewsletter)
	.delete(newsletterController.deleteNewsletter);

router.post("/:id/send", newsletterController.sendNewsletter);

module.exports = router;
