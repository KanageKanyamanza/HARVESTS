/**
 * Extends Email class with methods for CRM/Mailing communications
 */
function addEmailMailingMethod(EmailClass) {
	/**
	 * Sends a professional CRM/Mailing email using the mailing.pug template
	 * @param {string} content - HTML content rendered from Markdown
	 * @param {string} subject - Email subject
	 */
	EmailClass.prototype.sendMailing = async function (content, subject) {
		// We use the core 'send' method which handles Pug rendering, 
		// CSS styles, and production sending (SendGrid/Nodemailer)
		await this.send("mailing", subject, {
			content,
			subject, // Also passed to template variables
		});
	};
}

module.exports = addEmailMailingMethod;
