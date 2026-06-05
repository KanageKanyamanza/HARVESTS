const axios = require("axios");
const cron = require("node-cron");
const User = require("../models/User");

/**
 * Service de synchronisation avec Excel SharePoint via Power Automate
 */
class ExcelSyncService {
	constructor() {
		this.webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL || null;
		
		// Initialiser la tâche planifiée quotidienne si configurée
		if (process.env.EXCEL_DAILY_SYNC_ENABLED === "true") {
			this.initDailyCron();
		}
	}

	/**
	 * Formate la date actuelle au format DD/MM/YYYY
	 */
	formatDate(date = new Date()) {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	/**
	 * Nettoie les valeurs "À compléter"
	 */
	cleanName(str) {
		if (!str) return "";
		const s = str.toString().trim();
		if (s.toLowerCase() === "à compléter" || s.toLowerCase() === "acompleter") {
			return "";
		}
		return s;
	}

	/**
	 * Récupère le nom d'affichage de l'utilisateur selon son type en évitant les "À compléter"
	 */
	getUserDisplayName(user) {
		// 1. Tenter de récupérer le nom de la structure (selon type d'utilisateur)
		let businessName = "";
		if (user.userType === "producer") {
			businessName = this.cleanName(user.farmName);
		} else if (user.userType === "restaurateur") {
			businessName = this.cleanName(user.restaurantName);
		} else if (["transformer", "exporter", "transporter"].includes(user.userType)) {
			businessName = this.cleanName(user.companyName);
		}

		if (businessName) return businessName;

		// 2. Tenter de récupérer le nom de contact (firstName et lastName nettoyés)
		const first = this.cleanName(user.firstName);
		const last = this.cleanName(user.lastName);
		const fullName = `${first} ${last}`.trim();
		
		if (fullName) return fullName;

		// 3. Fallback sur n'importe quel autre nom commercial existant (au cas où)
		const anyBusinessName = this.cleanName(user.farmName) || this.cleanName(user.restaurantName) || this.cleanName(user.companyName);
		if (anyBusinessName) return anyBusinessName;

		// 4. Fallback ultime sur l'email
		return user.email || "Utilisateur sans nom";
	}

	/**
	 * Synchronise en temps réel une inscription individuelle
	 * @param {Object} user - L'utilisateur MongoDB créé
	 */
	async syncNewUserRealtime(user) {
		if (!this.webhookUrl) {
			return; // Pas configuré, ignorer silencieusement
		}

		try {
			const name = this.getUserDisplayName(user);
			const payload = {
				date: this.formatDate(user.createdAt),
				commercial: user.referredBy || "",
				producteurs: user.userType === "producer" ? name : "",
				transformateurs: user.userType === "transformer" ? name : "",
				restaurateurs: user.userType === "restaurateur" ? name : "",
				exportateurs: user.userType === "exporter" ? name : "",
				transporteurs: user.userType === "transporter" ? name : "",
				consommateurs: user.userType === "consumer" ? name : "",
				total: 1
			};

			console.log(`[ExcelSync] Envoi en temps réel pour l'utilisateur ${user.email} (Nom: ${name})`);
			await axios.post(this.webhookUrl, payload, { timeout: 5000 });
		} catch (error) {
			console.error("[ExcelSync] Erreur lors de la synchronisation en temps réel :", error.message);
		}
	}

	/**
	 * Récupère et envoie toutes les inscriptions individuelles de la journée
	 */
	async syncDailyRegistrations(targetDate = new Date()) {
		if (!this.webhookUrl) {
			console.warn("[ExcelSync] Synchronisation impossible : POWER_AUTOMATE_WEBHOOK_URL non défini.");
			return;
		}

		try {
			const startOfDay = new Date(targetDate);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(targetDate);
			endOfDay.setHours(23, 59, 59, 999);

			console.log(`[ExcelSync] Récupération des inscriptions du ${this.formatDate(startOfDay)}...`);

			const users = await User.find({
				createdAt: { $gte: startOfDay, $lte: endOfDay }
			}).sort({ createdAt: 1 });

			if (users.length === 0) {
				console.log("[ExcelSync] Aucune inscription aujourd'hui.");
				return;
			}

			console.log(`[ExcelSync] Envoi de ${users.length} inscriptions individuelles...`);
			for (const user of users) {
				await this.syncNewUserRealtime(user);
			}

			console.log(`[ExcelSync] Synchronisation quotidienne terminée avec succès.`);
		} catch (error) {
			console.error("[ExcelSync] Erreur lors de la synchronisation quotidienne :", error.message);
		}
	}

	/**
	 * Initialise le cron pour la synchronisation quotidienne à 23h55
	 */
	initDailyCron() {
		// S'exécute à 23h55 tous les jours
		cron.schedule("55 23 * * *", async () => {
			await this.syncDailyRegistrations();
		}, {
			timezone: "Africa/Dakar"
		});
		console.log("⏰ ExcelSync : Synchronisation quotidienne planifiée à 23h55 (Heure de Dakar)");
	}
}

module.exports = new ExcelSyncService();
