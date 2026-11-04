import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { subscriptionService } from "../../services";
import { formatPrice } from "../../utils/i18n";
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
	const { t, i18n } = useTranslation("public");
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const [billingPeriod, setBillingPeriod] = useState("monthly"); // 'monthly' or 'annual'
	const [paymentMethod, setPaymentMethod] = useState("cash");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);

	// Seule la partie non textuelle des plans vit ici : noms, sous-titres et
	// descriptions viennent de `pricing.plans.*`, déjà traduits pour la page
	// Tarifs (Jour 72 : la page de paiement était restée en français).
	const plans = {
		gratuit: { id: "gratuit", monthlyPrice: 0, annualPrice: 0 },
		standard: { id: "standard", monthlyPrice: 3000, annualPrice: 25000 },
		premium: { id: "premium", monthlyPrice: 10000, annualPrice: 75000 },
	};

	const selectedPlan = plans[planId] || plans.standard;
	const planCopy = (field) =>
		t(`pricing.plans.${selectedPlan.id}.${field}`, {
			returnObjects: false,
		});

	const priceLabel = (amount) => formatPrice(amount, "FCFA", i18n.language);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login", {
				state: { from: `/payment/subscription/${planId}` },
			});
		}
	}, [isAuthenticated, navigate, planId]);

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
				await subscriptionService.activateFreePlan(selectedPlan.id);
				navigate("/dashboard", {
					state: { message: t("pricing.checkout.successFree") },
				});
			} catch (err) {
				setError(
					err.response?.data?.message ||
						t("pricing.checkout.errors.freeActivation"),
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
						message: t("pricing.checkout.successCash", {
							plan: planCopy("name"),
						}),
					},
				});
			} catch (err) {
				setError(
					err.response?.data?.message ||
						t("pricing.checkout.errors.subscriptionCreation"),
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

	const paymentMethods = [
		{
			value: "cash",
			label: t("pricing.checkout.cashLabel"),
			description: t("pricing.checkout.cashDescription"),
		},
		{
			value: "paypal",
			label: t("pricing.checkout.paypalLabel"),
			description: t("pricing.checkout.paypalDescription"),
		},
	];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				{/* Header */}
				<button
					onClick={() => navigate("/pricing")}
					className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
				>
					<FiArrowLeft className="mr-2" />
					{t("pricing.checkout.backToPricing")}
				</button>

				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					{/* Plan Summary */}
					<div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
						<h1 className="text-3xl font-bold mb-2">
							{t("pricing.checkout.pageTitle", { plan: planCopy("name") })}
						</h1>
						<p className="text-lg opacity-90">{planCopy("subtitle")}</p>
						<p className="mt-4 opacity-80">{planCopy("description")}</p>
					</div>

					<form onSubmit={handleSubmit} className="p-8">
						{/* Billing Period Selection */}
						{selectedPlan.monthlyPrice > 0 && (
							<div className="mb-8">
								<h2 className="text-xl font-semibold mb-4 flex items-center">
									<FiCalendar className="mr-2" />
									{t("pricing.checkout.billingPeriod")}
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
										<div className="font-semibold text-lg mb-1">
											{t("pricing.checkout.monthly")}
										</div>
										<div className="text-2xl font-bold text-gray-900">
											{priceLabel(selectedPlan.monthlyPrice)}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											{t("pricing.checkout.perMonth")}
										</div>
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
										<div className="font-semibold text-lg mb-1">
											{t("pricing.checkout.annual")}
										</div>
										<div className="text-2xl font-bold text-gray-900">
											{priceLabel(selectedPlan.annualPrice)}
										</div>
										<div className="text-sm text-gray-600 mt-1">
											{discount && (
												<span className="line-through text-gray-400 mr-2">
													{priceLabel(selectedPlan.monthlyPrice * 12)}
												</span>
											)}
											{t("pricing.checkout.perYear")}
										</div>
										{discount && (
											<div className="text-sm text-green-600 font-medium mt-2">
												{t("pricing.checkout.save", {
													amount: priceLabel(discount.amount),
												})}
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
									{t("pricing.checkout.paymentMethod")}
								</h2>
								<div className="space-y-4">
									{paymentMethods.map((method) => {
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
													{t("pricing.checkout.cashInfoTitle")}
												</h3>
												<p className="text-sm text-green-700 mt-1">
													{t("pricing.checkout.cashInfoText")}
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
													{t("pricing.checkout.paypalInfoTitle")}
												</h3>
												<p className="text-sm text-blue-700 mt-1">
													{t("pricing.checkout.paypalInfoText")}
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
								{t("pricing.checkout.summaryTitle")}
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">
										{t("pricing.checkout.plan")}
									</span>
									<span className="font-medium">{planCopy("name")}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										{t("pricing.checkout.period")}
									</span>
									<span className="font-medium">
										{billingPeriod === "monthly" ?
											t("pricing.checkout.monthly")
										:	t("pricing.checkout.annual")}
									</span>
								</div>
								{discount && (
									<div className="flex justify-between text-green-600">
										<span>{t("pricing.checkout.discount")}</span>
										<span>-{priceLabel(discount.amount)}</span>
									</div>
								)}
								<hr className="my-3" />
								<div className="flex justify-between text-lg font-bold">
									<span>{t("pricing.checkout.total")}</span>
									<span>{priceLabel(price)}</span>
								</div>
								{billingPeriod === "monthly" && price > 0 && (
									<div className="text-sm text-gray-500 text-right">
										{t("pricing.checkout.billedMonthly")}
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
									{t("pricing.checkout.processing")}
								</>
							: price === 0 ?
								t("pricing.checkout.activateFree")
							: paymentMethod === "cash" ?
								t("pricing.checkout.confirm")
							:	t("pricing.checkout.proceed")}
						</button>

						{/* Security Notice */}
						<div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center">
							<FiShield className="mr-2" />
							{t("pricing.checkout.secureNotice")}
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionPayment;
