import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { subscriptionService } from "../../services";
import {
	FiArrowLeft,
	FiInfo,
	FiShield,
	FiCalendar,
	FiDollarSign,
	FiAlertCircle,
	FiCreditCard,
} from "react-icons/fi";

const SubscriptionPayment = () => {
	const { planId } = useParams();
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const [billingPeriod, setBillingPeriod] = useState("monthly"); // 'monthly' or 'annual'
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);

	const plans = {
		gratuit: {
			id: "gratuit",
			name: "Gratuit",
			subtitle: "Découverte",
			monthlyPrice: 0,
			annualPrice: 0,
			description:
				"Idéal pour les producteurs débutants souhaitant tester la plateforme sans engagement.",
		},
		standard: {
			id: "standard",
			name: "Standard",
			subtitle: "Professionnel",
			monthlyPrice: 3000,
			annualPrice: 25000,
			description:
				"Idéal pour les petits producteurs, coopératives ou transformateurs souhaitant développer leur visibilité et leurs ventes.",
		},
		premium: {
			id: "premium",
			name: "Premium",
			subtitle: "Export & Croissance",
			monthlyPrice: 10000,
			annualPrice: 75000,
			description:
				"Idéal pour les producteurs structurés, coopératives sérieuses, distributeurs et exportateurs.",
		},
	};

	const selectedPlan = plans[planId] || plans.standard;

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login", {
				state: { from: `/payment/subscription/${planId}` },
			});
		}
	}, [isAuthenticated, navigate, planId]);

	const formatPrice = (price) => {
		return new Intl.NumberFormat("fr-FR").format(price);
	};

	const getPrice = () => {
		return billingPeriod === "monthly" ?
				selectedPlan.monthlyPrice
			:	selectedPlan.annualPrice;
	};

	const getDiscount = () => {
		if (billingPeriod === "annual" && selectedPlan.monthlyPrice > 0) {
			const monthlyTotal = selectedPlan.monthlyPrice * 12;
			const discount = monthlyTotal - selectedPlan.annualPrice;
			const discountPercent = Math.round((discount / monthlyTotal) * 100);
			return { amount: discount, percent: discountPercent };
		}
		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (selectedPlan.monthlyPrice === 0 && selectedPlan.id === "gratuit") {
			// Pour le plan gratuit, on peut directement activer sans paiement
			try {
				setIsSubmitting(true);
				await subscriptionService.activateFreePlan("gratuit");
				navigate("/dashboard", {
					state: { message: "Plan gratuit activé avec succès!" },
				});
			} catch (err) {
				setError(
					err.response?.data?.message || "Erreur lors de l'activation du plan",
				);
				setIsSubmitting(false);
			}
			return;
		}

		if (paymentMethod === "cash") {
			// Pour le paiement cash, créer une souscription en attente
			try {
				setIsSubmitting(true);
				await subscriptionService.createSubscription({
					planId: selectedPlan.id,
					billingPeriod,
					paymentMethod: "cash",
					amount: getPrice(),
					currency: "XAF",
				});
				navigate("/dashboard", {
					state: {
						message: `Souscription ${selectedPlan.name} créée! Vous serez contacté pour le paiement.`,
					},
				});
			} catch (err) {
				setError(
					err.response?.data?.message ||
						"Erreur lors de la création de la souscription",
				);
				setIsSubmitting(false);
			}
		} else if (paymentMethod === "paypal") {
			// Pour PayPal, rediriger vers la page de checkout
			navigate(`/payment/subscription/${planId}/checkout`, {
				state: { billingPeriod },
			});
			setIsSubmitting(false);
		}
	};

	if (!isAuthenticated) {
		return null;
	}

	const price = getPrice();
	const discount = getDiscount();

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				{/* Header */}
				<button
					onClick={() => navigate("/pricing")}
					className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
				>
					<FiArrowLeft className="mr-2" />
					Retour aux tarifs
				</button>

				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					{/* Plan Summary */}
					<div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
						<h1 className="text-3xl font-bold mb-2">
							Souscription {selectedPlan.name}
						</h1>
						<p className="text-lg opacity-90">{selectedPlan.subtitle}</p>
						<p className="mt-4 opacity-80">{selectedPlan.description}</p>
					</div>

					<form onSubmit={handleSubmit} className="p-8">
						{/* Billing Period Selection */}
						{selectedPlan.monthlyPrice > 0 && (
							<div className="mb-8">
								<h2 className="text-xl font-semibold mb-4 flex items-center">
									<FiCalendar className="mr-2" />
									Période de facturation
								</h2>
								<div className="grid grid-cols-2 gap-4">
									<button
										type="button"
										onClick={() => setBillingPeriod("monthly")}
										className={`p-6 border-2 rounded-lg text-left transition ${
											billingPeriod === "monthly" ?
												"border-green-600 bg-green-50"
											:	"border-gray-200 hover:border-gray-300"
										}`}
									>
										<div className="font-semibold text-lg mb-1">Mensuel</div>
										<div className="text-2xl font-bold text-gray-900">
											{formatPrice(selectedPlan.monthlyPrice)} FCFA
										</div>
										<div className="text-sm text-gray-600 mt-1">par mois</div>
									</button>
									<button
										type="button"
										onClick={() => setBillingPeriod("annual")}
										className={`p-6 border-2 rounded-lg text-left transition relative ${
											billingPeriod === "annual" ?
												"border-green-600 bg-green-50"
											:	"border-gray-200 hover:border-gray-300"
										}`}
									>
										{discount && (
											<span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
												-{discount.percent}%
											</span>
										)}
										<div className="font-semibold text-lg mb-1">Annuel</div>
										<div className="text-2xl font-bold text-gray-900">
											{formatPrice(selectedPlan.annualPrice)} FCFA
										</div>
										<div className="text-sm text-gray-600 mt-1">
											{discount && (
												<span className="line-through text-gray-400 mr-2">
													{formatPrice(selectedPlan.monthlyPrice * 12)}
												</span>
											)}
											par an
										</div>
										{discount && (
											<div className="text-sm text-green-600 font-medium mt-2">
												Économisez {formatPrice(discount.amount)} FCFA
											</div>
										)}
									</button>
								</div>
							</div>
						)}

						{/* Payment Method Selection */}
						{price > 0 && (
							<div className="mb-8">
								<h2 className="text-xl font-semibold mb-4 flex items-center">
									<FiCreditCard className="mr-2" />
									Méthode de paiement
								</h2>
								<div className="space-y-4">
									{[
										{
											value: "cash",
											label: "Paiement à la livraison",
											description:
												"Vous serez contacté pour finaliser le paiement en espèces ou par mobile money.",
										},
										{
											value: "paypal",
											label: "PayPal ou Carte bancaire",
											description:
												"Payer en ligne via votre compte PayPal ou Carte bancaire, de façon sécurisée.",
										},
									].map((method) => {
										const IconComponent =
											method.value === "cash" ? FiDollarSign : FiCreditCard;
										return (
											<label
												key={method.value}
												className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
													paymentMethod === method.value ?
														"border-green-600 bg-green-50"
													:	"border-gray-200 hover:border-gray-300"
												}`}
											>
												<input
													type="radio"
													name="paymentMethod"
													value={method.value}
													checked={paymentMethod === method.value}
													onChange={(e) => setPaymentMethod(e.target.value)}
													className="h-4 w-4 text-green-600 focus:ring-green-600 mt-1"
												/>
												<div className="ml-3 flex-1">
													<div className="flex items-center space-x-2">
														<IconComponent className="h-6 w-6 text-gray-700" />
														<span className="text-sm font-medium text-gray-900">
															{method.label}
														</span>
													</div>
													<p className="text-sm text-gray-600 mt-2">
														{method.description}
													</p>
												</div>
											</label>
										);
									})}
								</div>

								{paymentMethod === "cash" && (
									<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-start">
											<FiInfo className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
											<div>
												<h3 className="text-sm font-medium text-green-800">
													Paiement à la livraison
												</h3>
												<p className="text-sm text-green-700 mt-1">
													Notre équipe vous contactera dans les 24 heures pour
													finaliser votre souscription et organiser le paiement.
												</p>
											</div>
										</div>
									</div>
								)}

								{paymentMethod === "paypal" && (
									<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
										<div className="flex items-start">
											<FiShield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
											<div>
												<h3 className="text-sm font-medium text-blue-800">
													Paiement sécurisé via PayPal
												</h3>
												<p className="text-sm text-blue-700 mt-1">
													Après validation, vous serez redirigé vers PayPal pour
													autoriser le paiement. Aucune information sensible
													n'est stockée par Harvests.
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Order Summary */}
						<div className="bg-gray-50 rounded-lg p-6 mb-8">
							<h3 className="text-lg font-semibold mb-4">
								Résumé de la souscription
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Plan</span>
									<span className="font-medium">{selectedPlan.name}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Période</span>
									<span className="font-medium">
										{billingPeriod === "monthly" ? "Mensuel" : "Annuel"}
									</span>
								</div>
								{discount && (
									<div className="flex justify-between text-green-600">
										<span>Remise</span>
										<span>-{formatPrice(discount.amount)} FCFA</span>
									</div>
								)}
								<hr className="my-3" />
								<div className="flex justify-between text-lg font-bold">
									<span>Total</span>
									<span>{formatPrice(price)} FCFA</span>
								</div>
								{billingPeriod === "monthly" && price > 0 && (
									<div className="text-sm text-gray-500 text-right">
										Facturé mensuellement
									</div>
								)}
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
								<FiAlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
								<p className="text-sm text-red-700">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{isSubmitting ?
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Traitement en cours...
								</>
							: price === 0 ?
								"Activer le plan gratuit"
							: paymentMethod === "cash" ?
								"Confirmer la souscription"
							:	"Procéder au paiement"}
						</button>

						{/* Security Notice */}
						<div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center">
							<FiShield className="mr-2" />
							Paiement sécurisé et crypté
						</div>
					</form>
				</div>

				{/* Modal PayPal et formulaire carte supprimés - redirection vers page dédiée SubscriptionCheckout.jsx */}
			</div>
		</div>
	);
};

// Composants PayPal supprimés - maintenant dans SubscriptionCheckout.jsx

export default SubscriptionPayment;
