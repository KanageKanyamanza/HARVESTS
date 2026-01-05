import { useMemo } from "react";
import { CURRENCIES, DEFAULT_CURRENCY } from "../config/currencies";

/**
 * Hook pour les calculs du panier
 */
export const useCartCalculations = (items) => {
	const totalItems = useMemo(() => {
		return items.reduce((total, item) => total + item.quantity, 0);
	}, [items]);

	const totalPrice = useMemo(() => {
		return items.reduce((total, item) => {
			const itemCurrency = item.currency || DEFAULT_CURRENCY;
			const amount = item.price * item.quantity;

			if (itemCurrency === DEFAULT_CURRENCY) {
				return total + amount;
			}

			// Conversion logic
			const currencyConfig = CURRENCIES.find((c) => c.code === itemCurrency);
			if (currencyConfig && currencyConfig.exchangeRate) {
				// Convert converted amount to base currency (FCFA)
				// Since our rates are relative to FCFA (e.g., 1 EUR = 655.957 FCFA)
				// We multiply by the rate
				return total + amount * currencyConfig.exchangeRate;
			}

			return total + amount; // Fallback to raw sum if no conversion found
		}, 0);
	}, [items]);

	const getItemCount = useMemo(() => {
		return (productId, originType = "product") => {
			const item = items.find(
				(item) => item.productId === productId && item.originType === originType
			);
			return item ? item.quantity : 0;
		};
	}, [items]);

	const isInCart = useMemo(() => {
		return (productId, originType = "product") => {
			return items.some(
				(item) => item.productId === productId && item.originType === originType
			);
		};
	}, [items]);

	return {
		totalItems,
		totalPrice,
		getItemCount,
		isInCart,
	};
};
