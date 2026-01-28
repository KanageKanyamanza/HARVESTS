const Email = require("../utils/email");

class EmailQueueService {
	constructor() {
		this.queue = [];
		this.isProcessing = false;
		this.maxRetries = 3;
		this.retryDelay = 5000; // 5 secondes
	}

	// Ajouter un email à la queue
	addToQueue(emailData) {
		// En mode test, ignorer l'ajout à la queue
		if (process.env.NODE_ENV === "test") {
			console.log(`⏭️  Mode TEST: Email ignoré pour ${emailData.email}`);
			return null;
		}

		const emailJob = {
			id: Date.now() + Math.random(),
			...emailData,
			retries: 0,
			createdAt: new Date(),
			status: "pending",
		};

		this.queue.push(emailJob);
		console.log(`📧 Email ajouté à la queue: ${emailData.email}`, {
			jobId: emailJob.id,
		});

		// Démarrer le traitement si pas déjà en cours
		if (!this.isProcessing) {
			this.processQueue();
		}

		return emailJob.id;
	}

	// Traiter la queue d'emails
	async processQueue() {
		// En mode test, ignorer le traitement de la queue
		if (process.env.NODE_ENV === "test") {
			this.queue = []; // Vider la queue
			return;
		}

		if (this.isProcessing || this.queue.length === 0) {
			return;
		}

		this.isProcessing = true;
		console.log(
			`🔄 Début du traitement de la queue d'emails (${this.queue.length} emails en attente)`,
		);

		while (this.queue.length > 0) {
			const job = this.queue.shift();

			try {
				await this.sendEmail(job);
				job.status = "completed";
				console.log(`✅ Email envoyé avec succès: ${job.email}`, {
					jobId: job.id,
				});
			} catch (err) {
				job.retries++;
				job.lastError = err.message;

				if (job.retries < this.maxRetries) {
					// Remettre en queue pour retry
					job.status = "retrying";
					setTimeout(() => {
						this.queue.unshift(job);
						this.processQueue();
					}, this.retryDelay * job.retries);

					console.log(
						`⏳ Email en retry (${job.retries}/${this.maxRetries}): ${job.email}`,
						{
							jobId: job.id,
							error: err.message,
						},
					);
				} else {
					// Échec définitif
					job.status = "failed";
					console.log(`❌ Email définitivement échoué: ${job.email}`, {
						jobId: job.id,
						error: err.message,
						retries: job.retries,
					});
				}
			}
		}

		this.isProcessing = false;
		console.log(`🏁 Traitement de la queue terminé`);
	}

	// Envoyer un email individuel
	async sendEmail(job) {
		const { user, verifyURL, language, emailType = "welcome" } = job;

		const email = new Email(user, verifyURL, language);

		switch (emailType) {
			case "welcome":
				await email.sendWelcome();
				break;
			case "verification":
				await email.sendEmailVerification();
				break;
			case "passwordReset":
				await email.sendPasswordReset();
				break;
			case "incompleteProfile":
				await email.sendIncompleteProfileReminder();
				break;
			case "newsletter":
				await email.sendNewsletter(
					job.content,
					job.subject,
					job.imageUrl,
					job.newsletterId,
					job.subscriberId,
				);
				break;
			default:
				await email.sendWelcome();
		}
	}

	// Obtenir le statut de la queue
	getQueueStatus() {
		return {
			total: this.queue.length,
			processing: this.isProcessing,
			pending: this.queue.filter((job) => job.status === "pending").length,
			retrying: this.queue.filter((job) => job.status === "retrying").length,
			completed: this.queue.filter((job) => job.status === "completed").length,
			failed: this.queue.filter((job) => job.status === "failed").length,
		};
	}

	// Nettoyer la queue (supprimer les jobs anciens)
	cleanupQueue(maxAge = 24 * 60 * 60 * 1000) {
		// 24 heures par défaut
		const cutoff = new Date(Date.now() - maxAge);
		const initialLength = this.queue.length;

		this.queue = this.queue.filter((job) => job.createdAt > cutoff);

		const removed = initialLength - this.queue.length;
		if (removed > 0) {
			console.log(
				`🧹 Nettoyage de la queue: ${removed} jobs anciens supprimés`,
			);
		}
	}
}

// Instance singleton
const emailQueue = new EmailQueueService();

// Nettoyer la queue toutes les heures
setInterval(
	() => {
		emailQueue.cleanupQueue();
	},
	60 * 60 * 1000,
);

module.exports = emailQueue;
