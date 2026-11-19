import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiHome, FiRefreshCw, FiShoppingBag, FiXCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

// Jour 79 — cancel_url du payin mobile money : aucun montant n'est débité, la
// commande reste en attente. On oublie l'essai abandonné pour que la page de
// confirmation reparte proprement sur une nouvelle demande.
const MobileMoneyCancel = () => {
	const { t } = useTranslation("payment");
	const { user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const orderId = params.get("orderId");

	useEffect(() => {
		if (!orderId) return;
		try {
			const storageKey = `harvests_mobile_money_${orderId}`;
			const stored = JSON.parse(sessionStorage.getItem(storageKey) || "null");
			// On garde opérateur/numéro/pays : « Reprendre le paiement » doit
			// pouvoir redémarrer sans faire ressaisir le contact, mais l'essai
			// abandonné ne doit pas être repollé (nouvel order_id à la relance).
			if (stored) {
				sessionStorage.setItem(
					storageKey,
					JSON.stringify({ ...stored, paymentId: null })
				);
			}
		} catch {
			// sessionStorage indisponible (navigation privée stricte) : sans
			// conséquence, la confirmation redemandera simplement l'opérateur.
		}
	}, [orderId]);

	const confirmationRoute = orderId
		? user?.userType === "restaurateur"
			? `/restaurateur/orders/${orderId}/confirmation`
			: `/consumer/orders/${orderId}/confirmation`
		: null;
	const ordersRoute =
		user?.userType === "restaurateur"
			? "/restaurateur/orders"
			: "/consumer/orders";

	return (
		<div className="min-h-screen bg-[#F8FAF6] py-10 px-4">
			<div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-8 text-center">
				<div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center">
					<FiXCircle className="h-8 w-8 text-amber-600" />
				</div>

				<h1 className="mt-4 text-xl font-extrabold text-[#161D14]">
					{t("cancel.title")}
				</h1>
				<p className="mt-2 text-sm text-gray-500">{t("cancel.text")}</p>

				<div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
					{confirmationRoute && (
						<button
							type="button"
							onClick={() => navigate(confirmationRoute)}
							className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
						>
							<FiRefreshCw className="mr-2 h-5 w-5" />
							{t("cancel.retry")}
						</button>
					)}
					<button
						type="button"
						onClick={() => navigate(ordersRoute)}
						className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<FiShoppingBag className="mr-2 h-5 w-5" />
						{t("cancel.viewOrders")}
					</button>
					<button
						type="button"
						onClick={() => navigate("/")}
						className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<FiHome className="mr-2 h-5 w-5" />
						{t("cancel.home")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileMoneyCancel;
