import React, { createContext, useContext, useState, useEffect } from "react";
import { CURRENCIES, DEFAULT_CURRENCY } from "../config/currencies";

const CurrencyContext = createContext();

export const useCurrency = () => {
	const context = useContext(CurrencyContext);
	if (!context) {
		throw new Error("useCurrency must be used within a CurrencyProvider");
	}
	return context;
};

export const CurrencyProvider = ({ children }) => {
	const [currency, setCurrency] = useState(() => {
		const saved = localStorage.getItem("harvests_currency");
		return saved || DEFAULT_CURRENCY;
	});

	useEffect(() => {
		localStorage.setItem("harvests_currency", currency);
	}, [currency]);

	const value = React.useMemo(
		() => ({
			currency,
			setCurrency,
			currencies: CURRENCIES,
		}),
		[currency, setCurrency],
	);

	return (
		<CurrencyContext.Provider value={value}>
			{children}
		</CurrencyContext.Provider>
	);
};
