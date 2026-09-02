import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, ChevronDown, ChevronUp } from "lucide-react";
import {
	COOKIE_CATEGORIES,
	getCookieConsent,
	setCookieConsent,
	onOpenCookiePreferences,
} from "../../utils/cookieConsent";

const CookieConsentBanner = () => {
	const [visible, setVisible] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [choices, setChoices] = useState({ performance: false, preference: false });

	useEffect(() => {
		if (!getCookieConsent()) setVisible(true);
	}, []);

	useEffect(() => {
		return onOpenCookiePreferences(() => {
			const existing = getCookieConsent();
			if (existing) {
				setChoices({ performance: existing.performance, preference: existing.preference });
			}
			setExpanded(true);
			setVisible(true);
		});
	}, []);

	if (!visible) return null;

	const save = (record) => {
		setCookieConsent(record);
		setVisible(false);
		setExpanded(false);
	};

	const focusRing =
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31BC2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161D14]";

	return (
		<div className="fixed inset-x-0 bottom-16 md:bottom-0 z-[90] p-3 sm:p-4 animate-fade-in-up">
			<div className="max-w-3xl mx-auto bg-[#161D14] text-emerald-50 rounded-2xl shadow-2xl border border-emerald-900/60 overflow-hidden">
				<div className="p-4 sm:p-5">
					<div className="flex items-start gap-2.5 mb-3">
						<Cookie className="w-5 h-5 text-[#31BC2E] flex-shrink-0 mt-0.5" />
						<p className="text-[13px] sm:text-sm text-emerald-50/90 leading-relaxed">
							Nous utilisons des cookies essentiels au fonctionnement de Harvests, et
							quelques cookies facultatifs pour améliorer le site. Vous choisissez
							lesquels accepter — voir notre{" "}
							<Link to="/privacy" className={`underline hover:text-white ${focusRing} rounded`}>
								Politique de Confidentialité
							</Link>
							.
						</p>
					</div>

					{/* Mobile : CTA principal en pleine largeur, actions secondaires côte à côte en dessous */}
					<div className="flex flex-col gap-2 sm:hidden">
						<button
							type="button"
							onClick={() => save({ performance: true, preference: true })}
							className={`w-full px-4 py-2.5 text-xs font-bold bg-[#31BC2E] text-[#0D1A0B] rounded-full hover:bg-[#3ed13a] transition-colors ${focusRing}`}
						>
							Tout accepter
						</button>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => save({ performance: false, preference: false })}
								className={`px-3 py-2.5 text-xs font-bold text-emerald-100 border border-emerald-800 rounded-full hover:bg-emerald-950 transition-colors ${focusRing}`}
							>
								Essentiels seulement
							</button>
							<button
								type="button"
								onClick={() => setExpanded((e) => !e)}
								aria-expanded={expanded}
								className={`flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold text-emerald-100 border border-emerald-800 rounded-full hover:bg-emerald-950 transition-colors ${focusRing}`}
							>
								Personnaliser
								{expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
							</button>
						</div>
					</div>

					{/* Desktop : une seule ligne, CTA principal à droite */}
					<div className="hidden sm:flex sm:items-center sm:gap-2">
						<button
							type="button"
							onClick={() => setExpanded((e) => !e)}
							aria-expanded={expanded}
							className={`flex items-center gap-1 px-3 py-2 text-xs font-bold text-emerald-100 hover:text-white transition-colors rounded-full ${focusRing}`}
						>
							Personnaliser
							{expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
						</button>
						<button
							type="button"
							onClick={() => save({ performance: false, preference: false })}
							className={`px-3.5 py-2 text-xs font-bold text-emerald-100 border border-emerald-800 rounded-full hover:bg-emerald-950 transition-colors ${focusRing}`}
						>
							Essentiels seulement
						</button>
						<button
							type="button"
							onClick={() => save({ performance: true, preference: true })}
							className={`px-3.5 py-2 text-xs font-bold bg-[#31BC2E] text-[#0D1A0B] rounded-full hover:bg-[#3ed13a] transition-colors ${focusRing}`}
						>
							Tout accepter
						</button>
					</div>
				</div>

				{expanded && (
					<div className="border-t border-emerald-900/60 p-4 sm:p-5 space-y-3 bg-black/10">
						{COOKIE_CATEGORIES.map((cat) => (
							<label
								key={cat.id}
								className={`flex items-start gap-3 ${cat.locked ? "opacity-70" : "cursor-pointer"}`}
							>
								<input
									type="checkbox"
									checked={cat.locked ? true : choices[cat.id]}
									disabled={cat.locked}
									onChange={(e) =>
										setChoices((prev) => ({ ...prev, [cat.id]: e.target.checked }))
									}
									className={`mt-1 h-4 w-4 rounded border-emerald-700 text-[#31BC2E] flex-shrink-0 ${focusRing}`}
								/>
								<span>
									<span className="block text-xs font-bold text-white">{cat.label}</span>
									<span className="block text-[11px] text-emerald-100/70">{cat.description}</span>
								</span>
							</label>
						))}
						<div className="pt-1">
							<button
								type="button"
								onClick={() => save(choices)}
								className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-bold bg-[#31BC2E] text-[#0D1A0B] rounded-full hover:bg-[#3ed13a] transition-colors ${focusRing}`}
							>
								Enregistrer mes choix
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CookieConsentBanner;
