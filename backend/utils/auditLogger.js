/**
 * Service de logging d'audit pour les actions sensibles
 */

const AuditLog = require("../models/AuditLog");

const AUDIT_ACTIONS = {
	// Auth
	LOGIN_SUCCESS: "LOGIN_SUCCESS",
	LOGIN_FAILED: "LOGIN_FAILED",
	LOGOUT: "LOGOUT",
	PASSWORD_RESET: "PASSWORD_RESET",
	PASSWORD_CHANGE: "PASSWORD_CHANGE",

	// Admin
	ADMIN_LOGIN: "ADMIN_LOGIN",
	USER_BANNED: "USER_BANNED",
	USER_UNBANNED: "USER_UNBANNED",
	USER_DELETED: "USER_DELETED",
	USER_VERIFIED: "USER_VERIFIED",
	USER_UPDATED: "USER_UPDATED",

	// Orders
	ORDER_CREATED: "ORDER_CREATED",
	ORDER_CANCELLED: "ORDER_CANCELLED",
	ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
	PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",

	// Products
	PRODUCT_CREATED: "PRODUCT_CREATED",
	PRODUCT_DELETED: "PRODUCT_DELETED",
	PRODUCT_APPROVED: "PRODUCT_APPROVED",
	PRODUCT_REJECTED: "PRODUCT_REJECTED",

	// Security
	SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
	RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
	ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
};

/**
 * Enregistre une action dans les logs d'audit
 */
const logAudit = async ({
	action,
	userId = null,
	userEmail = null,
	targetId = null,
	targetType = null,
	details = {},
	ip = null,
	userAgent = null,
	status = "success",
}) => {
	try {
		// En développement, log aussi en console
		if (process.env.NODE_ENV === "development") {
			console.log(`📋 AUDIT [${action}]`, {
				userId,
				userEmail,
				targetId,
				status,
				timestamp: new Date().toISOString(),
			});
		}

		// Sauvegarder en base de données
		await AuditLog.create({
			action,
			userId,
			userEmail,
			targetId,
			targetType,
			details,
			ip,
			userAgent,
			status,
			timestamp: new Date(),
		});
	} catch (error) {
		// Ne pas bloquer l'application si le logging échoue
		console.error("Erreur audit log:", error.message);
	}
};

/**
 * Middleware pour capturer les infos de requête
 */
const auditMiddleware = (action, options = {}) => {
	return async (req, res, next) => {
		// Stocker les infos pour utilisation ultérieure
		req.auditInfo = {
			action,
			ip: req.ip,
			userAgent: req.get("User-Agent"),
			...options,
		};
		next();
	};
};

/**
 * Helper pour logger après une action réussie
 */
const logSuccess = async (
	req,
	targetId = null,
	targetType = null,
	details = {}
) => {
	if (req.auditInfo) {
		await logAudit({
			...req.auditInfo,
			userId: req.user?._id,
			userEmail: req.user?.email,
			targetId,
			targetType,
			details,
			status: "success",
		});
	}
};

/**
 * Helper pour logger une action échouée
 */
const logFailure = async (req, error, targetId = null) => {
	await logAudit({
		action: req.auditInfo?.action || "UNKNOWN",
		userId: req.user?._id,
		userEmail: req.user?.email || req.body?.email,
		targetId,
		details: { error: error.message },
		ip: req.ip,
		userAgent: req.get("User-Agent"),
		status: "failure",
	});
};

module.exports = {
	AUDIT_ACTIONS,
	logAudit,
	auditMiddleware,
	logSuccess,
	logFailure,
};
