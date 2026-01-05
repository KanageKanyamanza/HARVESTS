import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useCart } from "../../../contexts/CartContext";
import { useCheckout } from "../../../hooks/useCheckout";
import {
	consumerService,
	orderService,
	restaurateurService,
} from "../../../services";
import cartService from "../../../services/cartService";
import {
	ProgressSteps,
	AddressStep,
	PaymentStep,
	ConfirmationStep,
} from "../../../components/checkout/CheckoutSteps";
import OrderSummary from "../../../components/checkout/OrderSummary";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { DEFAULT_CURRENCY } from "../../../config/currencies";

const Checkout = () => {
	const { user } = useAuth();
	const { items: cartItems, clearCart, removeFromCart } = useCart();
	const navigate = useNavigate();

	const {
		currentStep,
		orderData,
		submitting,
		setSubmitting,
		estimation,
		isEstimating,
		estimationError,
		handleInputChange,
		processCartItems,
		calculateTotals,
		validateStep,
		nextStep,
		prevStep,
	} = useCheckout(user, cartItems);

	const handleSubmitOrder = async () => {
		console.log("🛒 [Checkout] handleSubmitOrder appelé");
		console.log("🛒 [Checkout] User:", user);
		console.log("🛒 [Checkout] UserType:", user?.userType);
		console.log("🛒 [Checkout] CartItems:", cartItems);

		const step1Valid = validateStep(1);
		const step2Valid = validateStep(2);
		console.log("🛒 [Checkout] Validation Step 1:", step1Valid);
		console.log("🛒 [Checkout] Validation Step 2:", step2Valid);
		console.log("🛒 [Checkout] OrderData:", orderData);

		if (!step1Valid || !step2Valid) {
			console.warn(
				"🛒 [Checkout] Validation échouée, arrêt de la création de commande"
			);
			return;
		}

		setSubmitting(true);
		try {
			console.log("🛒 [Checkout] Traitement des articles du panier...");
			const { valid: validCartItems, invalid: invalidCartItems } =
				processCartItems();
			console.log("🛒 [Checkout] Articles valides:", validCartItems.length);
			console.log("🛒 [Checkout] Articles invalides:", invalidCartItems.length);

			if (invalidCartItems.length > 0) {
				invalidCartItems.forEach((item) =>
					removeFromCart(
						item.productId || item.id,
						item.originType || "product"
					)
				);
				window.alert(
					"Certains articles ne sont plus disponibles et ont été retirés."
				);
				if (validCartItems.length === 0) {
					setSubmitting(false);
					return;
				}
			}

			const orderPayload = {
				deliveryAddress: orderData.deliveryAddress,
				billingAddress: orderData.billingAddress.sameAsDelivery
					? orderData.deliveryAddress
					: orderData.billingAddress,
				paymentMethod: orderData.paymentMethod,
				paymentProvider: orderData.paymentProvider,
				deliveryMethod: orderData.deliveryMethod,
				notes: orderData.notes,
				useLoyaltyPoints: orderData.useLoyaltyPoints,
				loyaltyPointsToUse: orderData.loyaltyPointsToUse,
				currency: DEFAULT_CURRENCY,
				source: "web",
				items: validCartItems.map((item) => ({
					productId: item.productId || item.id,
					quantity: item.quantity,
					originType: item.originType || "product",
					supplierId: item.producer?.id,
					supplierType: item.producer?.type || item.originType || "producer",
					specialInstructions: item.specialInstructions || "",
				})),
			};

			// Utiliser le service approprié selon le type d'utilisateur
			let response;
			const userType = user?.userType || "consumer";

			console.log("🛒 [Checkout] Préparation de la requête de commande");
			console.log("🛒 [Checkout] UserType détecté:", userType);
			console.log(
				"🛒 [Checkout] OrderPayload:",
				JSON.stringify(orderPayload, null, 2)
			);

			if (userType === "restaurateur") {
				console.log(
					"🛒 [Checkout] Utilisation de restaurateurService.createOrder"
				);
				response = await restaurateurService.createOrder(orderPayload);
			} else {
				console.log("🛒 [Checkout] Utilisation de orderService.createOrder");
				response = await orderService.createOrder(orderPayload);
			}

			console.log("🛒 [Checkout] Réponse reçue:", response);
			console.log("🛒 [Checkout] Response.data:", response.data);

			const orderId =
				response.data?.data?.order?._id ||
				response.data?.order?._id ||
				response.data?.data?._id ||
				null;

			validCartItems.forEach((item) =>
				removeFromCart(item.productId || item.id, item.originType || "product")
			);
			clearCart();

			try {
				await cartService.clearCart();
			} catch (e) {
				console.error("Erreur vidage panier serveur:", e);
			}

			// Navigation adaptée selon le type d'utilisateur
			const ordersRoute =
				userType === "restaurateur"
					? "/restaurateur/orders"
					: "/consumer/orders";
			const confirmationRoute =
				userType === "restaurateur"
					? `/restaurateur/orders/${orderId}/confirmation`
					: `/consumer/orders/${orderId}/confirmation`;

			navigate(orderId ? confirmationRoute : ordersRoute);
		} catch (error) {
			console.error("🛒 [Checkout] Erreur création commande:", error);
			console.error("🛒 [Checkout] Error.response:", error.response);
			console.error(
				"🛒 [Checkout] Error.response?.data:",
				error.response?.data
			);
			console.error(
				"🛒 [Checkout] Error.response?.status:",
				error.response?.status
			);
			console.error("🛒 [Checkout] Error.message:", error.message);
			console.error("🛒 [Checkout] Error.stack:", error.stack);

			// Gestion d'erreur améliorée
			if (
				error.response?.status === 403 &&
				error.response?.data?.code === "EMAIL_VERIFICATION_REQUIRED"
			) {
				const message =
					error.response.data.message || "Vérification d'email requise";
				console.warn("🛒 [Checkout] Email non vérifié");
				window.alert(
					`${message}\n\nVeuillez vérifier votre email pour pouvoir passer une commande.`
				);
				// Optionnel : rediriger vers la page de vérification d'email
				// navigate('/verify-email');
			} else if (error.response?.data?.message) {
				console.error(
					"🛒 [Checkout] Erreur du serveur:",
					error.response.data.message
				);
				window.alert(`Erreur : ${error.response.data.message}`);
			} else if (error.message) {
				console.error("🛒 [Checkout] Erreur:", error.message);
				window.alert(`Erreur : ${error.message}`);
			} else {
				console.error("🛒 [Checkout] Erreur inconnue");
				window.alert(
					"Une erreur est survenue lors de la création de la commande. Veuillez réessayer."
				);
			}
		} finally {
			setSubmitting(false);
		}
	};

	const totals = calculateTotals();

	if (cartItems.length === 0) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<div className="text-center py-12">
					<FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
					<h2 className="mt-4 text-xl font-semibold text-gray-900">
						Votre panier est vide
					</h2>
					<p className="mt-2 text-gray-600">
						Ajoutez des produits avant de passer commande
					</p>
					<div className="mt-6">
						<button
							onClick={() => navigate("/cart")}
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
						>
							<FiArrowLeft className="mr-2 h-5 w-5" />
							Retour au panier
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="p-6 max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate("/cart")}
						className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
					>
						<FiArrowLeft className="h-4 w-4 mr-2" />
						Retour au panier
					</button>
					<h1 className="text-2xl font-bold text-gray-900">
						Finaliser la commande
					</h1>
					<p className="text-gray-600 mt-1">
						Étape {currentStep} sur 3 • {cartItems.length} article
						{cartItems.length > 1 ? "s" : ""}
					</p>
				</div>

				<ProgressSteps currentStep={currentStep} />

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						{currentStep === 1 && (
							<AddressStep
								orderData={orderData}
								handleInputChange={handleInputChange}
							/>
						)}
						{currentStep === 2 && (
							<PaymentStep
								orderData={orderData}
								handleInputChange={handleInputChange}
							/>
						)}
						{currentStep === 3 && (
							<ConfirmationStep orderData={orderData} cartItems={cartItems} />
						)}

						{/* Navigation */}
						<div className="mt-8 flex justify-between">
							<button
								onClick={prevStep}
								disabled={currentStep === 1}
								className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Précédent
							</button>

							{currentStep < 3 ? (
								<button
									onClick={nextStep}
									disabled={!validateStep(currentStep)}
									className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Suivant
								</button>
							) : (
								<button
									onClick={() => {
										console.log(
											'🛒 [Checkout] Bouton "Confirmer la commande" cliqué'
										);
										handleSubmitOrder();
									}}
									disabled={submitting || !validateStep(1) || !validateStep(2)}
									className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
								>
									{submitting ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Création...
										</>
									) : (
										"Confirmer la commande"
									)}
								</button>
							)}
						</div>
					</div>

					<div className="lg:col-span-1">
						<OrderSummary
							cartItems={cartItems}
							totals={totals}
							isEstimating={isEstimating}
							estimation={estimation}
							estimationError={estimationError}
							orderData={orderData}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Checkout;
