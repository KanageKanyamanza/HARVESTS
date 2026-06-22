const express = require("express");
const mailingContactController = require("../controllers/mailingContactController");
const adminAuthController = require("../controllers/adminAuthController");

const router = express.Router();

// All routes are protected and restricted to super-admin or technical admins
router.use(adminAuthController.protect);
router.use(adminAuthController.restrictTo('super-admin', 'admin'));

router.get("/emails-only", mailingContactController.getEmailsOnly);

router
	.route("/")
	.get(mailingContactController.getAllContacts)
	.post(mailingContactController.bulkImport);

router.post("/send-bulk", mailingContactController.sendBulkEmails);

router.delete("/:id", mailingContactController.deleteContact);

module.exports = router;
