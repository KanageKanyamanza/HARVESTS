import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService } from "../../../services";
import {
	FiStar,
	FiCalendar,
	FiDollarSign,
	FiCheckCircle,
	FiAlertCircle,
	FiXCircle,
	FiClock,
} from "react-icons/fi";

const SubscriptionSection = () => {
	const [subscription, setSubscription] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		loadSubscription();
	}, []);

	const getDaysRemaining = (endDate) => {
		if (!endDate) return null;
		const end = new Date(endDate);
		const now = new Date();
		const diffTime = end - now;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const loadSubscription = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await subscriptionService.getMySubscriptions();

			// Vérifier la structure de la réponse
			const subscriptions =
				response?.data?.data?.subscriptions ||
				response?.data?.subscriptions ||
				[];

			if (Array.isArray(subscriptions) && subscriptions.length > 0) {
				// Trouver l'abonnement actif
				const activeSubscription =
					subscriptions.find((sub) => sub.status === "active") ||
					subscriptions[0];

				setSubscription(activeSubscription);
			} else {
				setSubscription(null);
			}
		} catch (err) {
			console.error("Erreur lors du chargement de l'abonnement:", err);
			if (err.response?.status === 401) {
				// L'utilisateur n'a pas accès ou n'est pas encore autorisé : traiter comme absence d'abonnement
				setSubscription(null);
				return;
			}
			// Ne pas afficher d'erreur si c'est juste qu'il n'y a pas d'abonnement
			if (err.response?.status !== 404) {
				setError("Impossible de charger l'abonnement");
			} else {
				setSubscription(null);
			}
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (price) => {
		return new Intl.NumberFormat("fr-FR").format(price);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStatusBadge = (status) => {
		const badges = {
			active: {
				icon: <FiCheckCircle className="h-4 w-4" />,
				className: "bg-green-100 text-green-800",
				text: "Actif",
			},
			pending: {
				icon: <FiClock className="h-4 w-4" />,
				className: "bg-yellow-100 text-yellow-800",
				text: "En attente",
			},
			suspended: {
				icon: <FiAlertCircle className="h-4 w-4" />,
				className: "bg-orange-100 text-orange-800",
				text: "Suspendu",
			},
			cancelled: {
				icon: <FiXCircle className="h-4 w-4" />,
				className: "bg-red-100 text-red-800",
				text: "Annulé",
			},
			expired: {
				icon: <FiXCircle className="h-4 w-4" />,
				className: "bg-gray-100 text-gray-800",
				text: "Expiré",
			},
		};

		const badge = badges[status] || badges.pending;
		return (
			<span
				className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
			>
				{badge.icon}
				{badge.text}
			</span>
		);
	};

	const getPlanName = (planId) => {
		const plans = {
			gratuit: "Gratuit",
			standard: "Standard",
			premium: "Premium",
		};
		return plans[planId] || planId;
	};

	const getPlanColor = (planId) => {
		const colors = {
			gratuit: "text-gray-600",
			standard: "text-green-600",
			premium: "text-emerald-600",
		};
		return colors[planId] || "text-gray-600";
	};

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
					<div className="h-20 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<div className="text-red-600 text-sm">{error}</div>
			</div>
		);
	}

	if (!subscription) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900 flex items-center">
						<FiStar className="h-5 w-5 mr-2 text-yellow-500" />
						Mon Abonnement
					</h3>
				</div>
				<div className="text-center py-8">
					<p className="text-gray-600 mb-4">Aucun abonnement actif</p>
					<button
						onClick={() => navigate("/pricing")}
						className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Voir les plans disponibles
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center">
					<FiStar
						className={`h-5 w-5 mr-2 ${getPlanColor(subscription.planId)}`}
					/>
					Mon Abonnement
				</h3>
				{getStatusBadge(subscription.status)}
			</div>

			<div className="space-y-4">
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-700">Plan</span>
						<span
							className={`text-lg font-bold ${getPlanColor(
								subscription.planId
							)}`}
						>
							{getPlanName(subscription.planId)}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 flex items-center">
						<FiDollarSign className="h-4 w-4 mr-1" />
						Montant
					</span>
					<span className="font-semibold text-gray-900">
						{formatPrice(subscription.amount)} {subscription.currency}
						{subscription.billingPeriod === "monthly" && (
							<span className="text-gray-500 text-xs ml-1">/mois</span>
						)}
						{subscription.billingPeriod === "annual" && (
							<span className="text-gray-500 text-xs ml-1">/an</span>
						)}
					</span>
				</div>

				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600 flex items-center">
						<FiCalendar className="h-4 w-4 mr-1" />
						Période
					</span>
					<span className="font-medium text-gray-900">
						{subscription.billingPeriod === "monthly" ? "Mensuel" : "Annuel"}
					</span>
				</div>

				{subscription.endDate && (
					<div className="pt-4 border-t border-gray-200">
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600">Date d'expiration</span>
							<span className="font-medium text-gray-900">
								{formatDate(subscription.endDate)}
							</span>
						</div>
						{subscription.nextBillingDate &&
							subscription.status === "active" && (
								<div className="flex items-center justify-between text-sm mt-2">
									<span className="text-gray-600">Prochain paiement</span>
									<span className="font-medium text-gray-900">
										{formatDate(subscription.nextBillingDate)}
									</span>
								</div>
							)}
					</div>
				)}

				{subscription.status === "active" && (
					<>
						{(() => {
							const daysRemaining = getDaysRemaining(subscription.endDate);
							if (
								daysRemaining !== null &&
								daysRemaining <= 7 &&
								daysRemaining >= 0
							) {
								return (
									<div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
										<FiAlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
										<div>
											<p className="text-sm font-medium text-orange-800">
												Expiration imminent
											</p>
											<p className="text-xs text-orange-700 mt-1">
												Votre abonnement expire dans {daysRemaining} jour
												{daysRemaining > 1 ? "s" : ""}. Renouvelez maintenant
												pour éviter toute interruption.
											</p>
										</div>
									</div>
								);
							}
							return null;
						})()}

						<div className="pt-4">
							<button
								onClick={() => navigate("/pricing")}
								className="w-full px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
								title={
									getDaysRemaining(subscription.endDate) <= 7
										? "Renouveler d'urgence"
										: "Gérer l'abonnement"
								}
							>
								{getDaysRemaining(subscription.endDate) <= 7
									? "Renouveler maintenant"
									: "Gérer mon abonnement"}
							</button>
						</div>
					</>
				)}

				{subscription.status !== "active" && (
					<div className="pt-4">
						<button
							onClick={() => navigate("/pricing")}
							className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
						>
							Activer un plan
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SubscriptionSection;
