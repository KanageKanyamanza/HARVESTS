import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import {
	changeLanguage,
	getCurrentLanguage,
	getAvailableLanguages,
	getLanguageInfo,
} from "../../utils/i18n";

// Sélecteur fr/en (Jour 35 du plan bilingue) — utilisé dans DashboardTopbar et
// dans le header public. Suit le même motif "dropdown maison" (useState +
// clic extérieur) que les autres menus déroulants du projet (pas de
// dépendance headless supplémentaire).
const LanguageSelector = ({ className = "" }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [language, setLanguage] = useState(getCurrentLanguage());
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (lang) => {
		changeLanguage(lang);
		setLanguage(lang);
		setIsOpen(false);
	};

	const currentInfo = getLanguageInfo(language);

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 transition-colors"
				aria-label="Changer de langue"
			>
				<Globe className="h-3.5 w-3.5" />
				{currentInfo.flag}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden">
					{getAvailableLanguages().map((lang) => {
						const info = getLanguageInfo(lang);
						const isActive = lang === language;
						return (
							<button
								key={lang}
								type="button"
								onClick={() => handleSelect(lang)}
								className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-gray-50 ${
									isActive ? "font-semibold text-harvests-green" : "text-gray-700"
								}`}
							>
								{info.nativeName}
								{isActive && <Check className="h-4 w-4" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default LanguageSelector;
