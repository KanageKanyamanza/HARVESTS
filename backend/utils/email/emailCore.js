const pug = require("pug");
const htmlToText = require("html-to-text");
const addEmailTransportMethods = require("./emailTransport");

// Méthode principale d'envoi d'email
function addEmailCoreMethods(EmailClass) {
	// Envoyer l'email avec fallback EmailJS (si configuré)
	EmailClass.prototype.send = async function (template, subject) {
		const isProduction = process.env.NODE_ENV === "production";
		const isTest = process.env.NODE_ENV === "test";

		// En mode test, ignorer l'envoi d'emails
		if (isTest) {
			console.log(`⏭️  Mode TEST: Email ignoré pour ${this.to} (${subject})`);
			return {
				messageId: "test-mode-skipped",
				response: "Email ignoré en mode test",
				testMode: true,
			};
		}

		// 1) Générer le HTML basé sur un template pug
		const frontendUrl = process.env.FRONTEND_URL || "https://www.harvests.site";
		const logoUrl = `${frontendUrl}/logo.png`;
		const html = pug.renderFile(
			`${__dirname}/../../views/email/${template}.pug`,
			{
				firstName: this.firstName,
				url: this.url,
				subject,
				logoUrl,
			}
		);

		const text = htmlToText.convert(html);

		// 2) PRODUCTION ou DÉVELOPPEMENT avec SendGrid: Utiliser SendGrid API (pas SMTP)
		// Utiliser SendGrid si la clé API est définie (production ou développement)
		if (process.env.SENDGRID_API_KEY) {
			try {
				const envLabel = isProduction ? "PRODUCTION" : "TEST";
				console.log(
					`📧 Tentative d'envoi email à ${this.to} via SendGrid API (${envLabel})`
				);
				const result = await this.sendWithSendGrid(subject, html, text);
				return result;
			} catch (error) {
				console.error("❌ Erreur SendGrid API:", error.message);

				// Fallback EmailJS si configuré
				if (this.isEmailJSConfigured()) {
					console.log("🔄 Tentative de fallback avec EmailJS...");
					try {
						await this.sendWithEmailJS(subject, html);
						console.log("✅ Email envoyé avec succès via EmailJS (fallback)");
						return;
					} catch (emailjsError) {
						console.error("❌ Erreur EmailJS également:", emailjsError.message);
						throw new Error(
							`Échec envoi email: SendGrid (${error.message}) et EmailJS (${emailjsError.message})`
						);
					}
				} else {
					throw new Error(
						`Échec envoi email: SendGrid (${error.message}) - EmailJS non configuré`
					);
				}
			}
		}

		// 3) DÉVELOPPEMENT: Utiliser Gmail avec Nodemailer
		try {
			const transporter = this.newTransport();
			if (!transporter) {
				throw new Error("Aucun transport email configuré");
			}

			console.log(
				`📧 Tentative d'envoi email à ${this.to} via Gmail (DÉVELOPPEMENT)`
			);

			const mailOptions = {
				from: this.from,
				to: this.to,
				subject,
				html,
				text,
			};

			const result = await transporter.sendMail(mailOptions);
			console.log("✅ Email envoyé avec succès via Nodemailer");
			console.log(`   Message ID: ${result.messageId}`);
			console.log(`   Response: ${result.response}`);
			return result;
		} catch (error) {
			console.error("❌ Erreur Nodemailer détaillée:");
			console.error(`   Message: ${error.message}`);
			console.error(`   Code: ${error.code || "N/A"}`);

			if (error.code === "EAUTH" || error.message.includes("Invalid login")) {
				console.error("🔐 ERREUR D'AUTHENTIFICATION:");
				console.error("   - Vérifiez GMAIL_USER et GMAIL_APP_PASSWORD");
				console.error(
					"   - Pour Gmail: Activez l'authentification 2FA et créez un mot de passe d'application"
				);
			} else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
				console.error("🔌 ERREUR DE CONNEXION/TIMEOUT:");
				console.error("   - Vérifiez votre connexion internet");
				console.error("   - Vérifiez que Gmail est accessible");
			}

			// Fallback EmailJS si configuré
			if (this.isEmailJSConfigured()) {
				console.log("🔄 Tentative de fallback avec EmailJS...");
				try {
					await this.sendWithEmailJS(subject, html);
					console.log("✅ Email envoyé avec succès via EmailJS (fallback)");
					return;
				} catch (emailjsError) {
					console.error("❌ Erreur EmailJS également:", emailjsError.message);
					throw new Error(
						`Échec envoi email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`
					);
				}
			} else {
				throw new Error(
					`Échec envoi email: Nodemailer (${error.message}) - EmailJS non configuré`
				);
			}
		}
	};

	// Envoyer email de test simple avec fallback
	EmailClass.prototype.sendTestEmail = async function () {
		const isProduction = process.env.NODE_ENV === "production";
		const frontendUrl = process.env.FRONTEND_URL || "https://www.harvests.site";
		const logoUrl = `${frontendUrl}/logo.png`;

		const testHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Harvests</title>
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
            <div class="title">Test de Configuration</div>
            <div class="subtitle">Vérification du système d'envoi d'emails</div>
          </div>
          
          <div class="content">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Bonjour ${
							this.firstName
						},</h2>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-bottom: 20px; color: #166534;">
              <p style="margin: 0; font-weight: bold;">✅ ${
								isProduction ? "SendGrid API" : "Nodemailer"
							} fonctionne parfaitement !</p>
            </div>
            
            <p style="margin-bottom: 10px;">Ceci est un email de test pour confirmer que :</p>
            <ul style="margin-bottom: 20px; padding-left: 20px; color: #4a5568;">
              <li style="margin-bottom: 5px;">Votre configuration email est opérationnelle</li>
              <li style="margin-bottom: 5px;">Le système Harvests peut envoyer des emails</li>
              <li style="margin-bottom: 5px;">Le format HTML est correctement rendu</li>
            </ul>
            
            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #a0aec0;">
              Email envoyé le ${new Date().toLocaleString("fr-FR")}
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-brand">🌱 Harvests</div>
            <div class="footer-contact">
              Plateforme agricole africaine
            </div>
            <div class="footer-contact">
              Ceci est un email automatique de test.
            </div>
             <div class="footer-contact">
              © ${new Date().getFullYear()} Harvests. Tous droits réservés.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

		const subject = `🧪 Test Harvests - ${
			isProduction ? "SendGrid API" : "Nodemailer"
		}`;
		const text = `Test Harvests - ${
			isProduction ? "SendGrid API" : "Nodemailer"
		} fonctionne ! Email envoyé à ${this.firstName}`;

		// En production, utiliser SendGrid API
		if (isProduction && process.env.SENDGRID_API_KEY) {
			try {
				const result = await this.sendWithSendGrid(subject, testHtml, text);
				console.log("✅ Email de test envoyé avec succès via SendGrid API !");
				return result;
			} catch (error) {
				console.error("❌ Erreur SendGrid API:", error.message);

				if (this.isEmailJSConfigured()) {
					try {
						const emailjsResult = await this.sendWithEmailJS(subject, testHtml);
						console.log(
							"✅ Email de test envoyé avec succès via EmailJS (fallback) !"
						);
						return emailjsResult;
					} catch (emailjsError) {
						console.error("❌ Erreur EmailJS également:", emailjsError.message);
						throw new Error(
							`Échec test email: SendGrid (${error.message}) et EmailJS (${emailjsError.message})`
						);
					}
				} else {
					throw new Error(
						`Échec test email: SendGrid (${error.message}) - EmailJS non configuré`
					);
				}
			}
		}

		// En développement, utiliser Nodemailer
		try {
			const transporter = this.newTransport();
			if (!transporter) {
				throw new Error("Aucun transport email configuré");
			}

			const mailOptions = {
				from: this.from,
				to: this.to,
				subject,
				html: testHtml,
				text,
			};

			const testEmail = await transporter.sendMail(mailOptions);
			console.log("✅ Email de test envoyé avec succès via Nodemailer !");
			return testEmail;
		} catch (error) {
			console.error("❌ Erreur Nodemailer:", error.message);

			if (this.isEmailJSConfigured()) {
				try {
					const emailjsResult = await this.sendWithEmailJS(subject, testHtml);
					console.log(
						"✅ Email de test envoyé avec succès via EmailJS (fallback) !"
					);
					return emailjsResult;
				} catch (emailjsError) {
					console.error("❌ Erreur EmailJS également:", emailjsError.message);
					throw new Error(
						`Échec test email: Nodemailer (${error.message}) et EmailJS (${emailjsError.message})`
					);
				}
			} else {
				throw new Error(
					`Échec test email: Nodemailer (${error.message}) - EmailJS non configuré`
				);
			}
		}
	};
}

module.exports = addEmailCoreMethods;
