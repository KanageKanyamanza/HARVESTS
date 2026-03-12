const htmlToText = require("html-to-text");

function addEmailNewsletterMethod(EmailClass) {
	// Method to send a newsletter with custom HTML content
	EmailClass.prototype.sendNewsletter = async function (
		htmlContent,
		subject,
		imageUrl,
		newsletterId,
		subscriberId
	) {
		const isProduction = process.env.NODE_ENV === "production";
		const text = htmlToText.convert(htmlContent);

		// Add standard wrapper if needed, or assume htmlContent is complete
		// For now, let's wrap it in a simple div
		const imageHtml = imageUrl
			? `<div style="text-align: center; margin-bottom: 20px;">
          <img src="${imageUrl}" alt="${subject}" style="max-width: 100%; height: auto; border-radius: 8px;" />
        </div>`
			: "";

		// Generate tracking pixel URL if IDs are provided
		let trackingPixelHtml = "";
		if (newsletterId && subscriberId) {
			// Determine API Base URL
			let apiBase;
			if (process.env.BACKEND_URL) {
				apiBase = `${process.env.BACKEND_URL}/api/v1`;
			} else if (process.env.API_BASE_URL) {
				apiBase = process.env.API_BASE_URL;
			} else {
				// Fallback based on environment
				const port = process.env.PORT || 5000;
				apiBase = isProduction
					? "https://harvests-bp63.onrender.com/api/v1"
					: `http://localhost:${port}/api/v1`;
			}

			const trackingUrl = `${apiBase}/newsletter/track/${newsletterId}/${subscriberId}`;
			trackingPixelHtml = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="" />`;
		}

		// Define logo URL (consistent with emailCore.js)
		const frontendUrl = process.env.FRONTEND_URL || "https://www.harvests.site";
		const logoUrl = `${frontendUrl}/logo.png`;

		const wrappedHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #f7fafc;
            margin: 0;
            padding: 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            border-radius: 12px 12px 0 0;
          }
          .logo {
            width: 120px;
            height: 120px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 10px;
          }
          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
          }
          .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
          }
          .content {
            padding: 40px 30px;
          }
          .newsletter-image {
            text-align: center;
            margin-bottom: 20px;
          }
          .newsletter-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
          .footer {
            background-color: #1f2937;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            line-height: 1.6;
            border-radius: 0 0 12px 12px;
          }
          .footer-brand {
            color: #ffffff;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .footer-contact {
            margin: 12px 0;
          }
          .footer-contact a {
            color: #16a34a;
            text-decoration: none;
          }
          .footer-contact a:hover {
            text-decoration: underline;
          }
          .unsubscribe-link {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 20px;
            display: block;
          }
          .unsubscribe-link a {
            color: #9ca3af;
            text-decoration: underline;
          }
          @media (max-width: 600px) {
            .email-container { margin: 0; border-radius: 0; }
            .header, .footer { border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .title { font-size: 24px; }
            .logo { width: 100px; height: 100px; padding: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">
              <img src="${logoUrl}" alt="Harvests Logo" />
            </div>
            <div class="title">Newsletter Harvests</div>
            <div class="subtitle">Les dernières nouvelles de l'agriculture africaine</div>
          </div>
          
          <div class="content">
            ${trackingPixelHtml}
            ${
							imageHtml
								? `<div class="newsletter-image">${imageHtml.replace(
										/<div.*?>|<\/div>/g,
										""
								  )}</div>`
								: ""
						}
            
            ${htmlContent}
          </div>
          
          <div class="footer">
            <div class="footer-brand">🌱 Harvests</div>
            <div class="footer-contact">
              Plateforme agricole africaine - Connectons l'Afrique à travers l'agriculture
            </div>
            <div class="footer-contact">
              Questions ? Contactez-nous :<br>
              📞 Sénégal : <a href="tel:+221771970713">+221 771970713</a> / <a href="tel:+221774536704">+221 774536704</a><br>
              📧 Email : <a href="mailto:contact@harvests.site">contact@harvests.site</a>
            </div>
            
            <div style="margin-top: 20px;">
              <a href="${
								this.url
							}/about" style="color: #9ca3af; margin: 0 10px; text-decoration: none;">À propos</a>
              <a href="${
								this.url
							}/contact" style="color: #9ca3af; margin: 0 10px; text-decoration: none;">Contact</a>
              <a href="${
								this.url
							}/privacy" style="color: #9ca3af; margin: 0 10px; text-decoration: none;">Confidentialité</a>
            </div>

            <div class="unsubscribe-link">
              Vous recevez cet email car vous êtes abonné à la newsletter de Harvests.<br>
              <br>
              <a href="${this.url}/unsubscribe?email=${
			this.to
		}" style="display: inline-block; padding: 10px 20px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 5px;">Se désabonner</a>
            </div>
            
            <div style="margin-top: 10px; color: #6b7280; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Harvests. Tous droits réservés. | Dakar, Sénégal
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

		// Production: Use SendGrid
		if (process.env.SENDGRID_API_KEY) {
			try {
				console.log(`📧 Sending newsletter to ${this.to} via SendGrid`);
				return await this.sendWithSendGrid(subject, wrappedHtml, text);
			} catch (error) {
				console.error("❌ SendGrid Error:", error.message);
				// Fallback to EmailJS not implemented here to avoid complexity loop, but could be added
				if (this.isEmailJSConfigured()) {
					return await this.sendWithEmailJS(subject, wrappedHtml);
				}
				throw error;
			}
		}

		// Development: Use Nodemailer
		try {
			const transporter = this.newTransport();
			if (!transporter) {
				throw new Error("No email transport configured");
			}

			console.log(`📧 Sending newsletter to ${this.to} via Nodemailer`);

			const mailOptions = {
				from: this.from,
				to: this.to,
				subject,
				html: wrappedHtml,
				text,
			};

			const result = await transporter.sendMail(mailOptions);
			return result;
		} catch (error) {
			console.error("❌ Nodemailer Error:", error.message);
			if (this.isEmailJSConfigured()) {
				return await this.sendWithEmailJS(subject, wrappedHtml);
			}
			throw error;
		}
	};
}

module.exports = addEmailNewsletterMethod;
