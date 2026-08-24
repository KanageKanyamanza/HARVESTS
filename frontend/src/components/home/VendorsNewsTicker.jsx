import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Sprout } from "lucide-react";
import { producerService } from "../../services";

const getDisplayName = (p) =>
	p.shopInfo?.shopName ||
	(p.farmName && p.farmName !== "À compléter" ? p.farmName : null) ||
	`${p.firstName || ""} ${p.lastName && p.lastName !== "À compléter" ? p.lastName : ""}`.trim() ||
	"Producteur Harvests";

// Vitesse constante (px/s) : la durée de l'animation est calculée à partir de
// la largeur réelle du contenu, pour que TOUS les noms défilent lisiblement
// avant la boucle, peu importe combien de producteurs sont chargés (une durée
// fixe faisait "boucler" trop tôt visuellement dès qu'il y avait peu de noms).
// MAX_DURATION plafonne la boucle : avec 100+ producteurs, PX_PER_SECOND seul
// donnait un tour complet de plusieurs minutes (quasi imperceptible à l'oeil).
const PX_PER_SECOND = 65;
const MIN_DURATION = 12;
const MAX_DURATION = 90;

const VendorsNewsTicker = () => {
	const [vendors, setVendors] = useState([]);
	// null tant que la durée n'a pas été mesurée : l'animation ne démarre
	// qu'une fois cette valeur connue, pour ne jamais la modifier sur une
	// animation déjà en cours (Chrome saute/redémarre la position quand on
	// change animation-duration en plein vol — c'était la cause du bug
	// "ça repart du début" toujours au même endroit).
	const [duration, setDuration] = useState(null);
	const trackRef = useRef(null);

	useEffect(() => {
		let cancelled = false;
		const loadVendors = async () => {
			try {
				// useLocation:false -> tous les producteurs, pas seulement ceux de la
				// zone détectée du visiteur. namesOnly:true -> ne pas exiger de bannière
				// de boutique (requis pour les cartes marketplace, pas pour un simple nom).
				const response = await producerService.getAllPublic({
					limit: 100,
					useLocation: "false",
					namesOnly: "true",
				});
				if (cancelled) return;
				const list = response.data?.data?.producers || [];
				const names = list.map((p) => ({ id: p._id, name: getDisplayName(p) }));
				setVendors(names);
			} catch {
				// Bande passante silencieuse : pas de blocage de la home si l'appel échoue
			}
		};
		loadVendors();
		return () => {
			cancelled = true;
		};
	}, []);

	// Mesure la largeur réelle du contenu UNE SEULE fois par jeu de vendeurs,
	// avant que l'animation ne démarre (elle n'est appliquée au DOM qu'une
	// fois `duration` connu, cf. le rendu plus bas).
	useEffect(() => {
		if (vendors.length === 0) {
			setDuration(null);
			return;
		}
		setDuration(null);
		let done = false;
		const measure = () => {
			if (done) return;
			done = true;
			const el = trackRef.current;
			if (!el) return;
			const halfWidth = el.scrollWidth / 2;
			const computed = Math.min(MAX_DURATION, Math.max(MIN_DURATION, halfWidth / PX_PER_SECOND));
			setDuration(computed);
		};
		// Deux rAF : laisse le DOM peindre le nouveau contenu (et les polices
		// finir de charger) avant de mesurer, pour une largeur stable. Un
		// timeout de secours prend le relais si l'onglet est en arrière-plan
		// (les rAF sont alors mis en pause par le navigateur).
		const raf1 = requestAnimationFrame(() => {
			requestAnimationFrame(measure);
		});
		const fallback = setTimeout(measure, 400);
		return () => {
			done = true;
			cancelAnimationFrame(raf1);
			clearTimeout(fallback);
		};
	}, [vendors]);

	if (vendors.length === 0) return null;

	// Dupliqué pour une boucle de défilement continue et sans coupure
	const loopVendors = [...vendors, ...vendors];

	return (
		<div className="relative bg-[#161D14] text-white overflow-hidden border-y border-emerald-900/60">
			<div className="flex items-stretch">
				{/* Badge "EN DIRECT" façon JT */}
				<div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 bg-[#31BC2E] text-[#0D1A0B] px-2.5 sm:px-5 py-2 font-black text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest">
					<Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse flex-shrink-0" />
					<span className="sm:hidden">Prod.</span>
					<span className="hidden sm:inline">Nos Producteurs</span>
				</div>

				{/* Bandeau défilant */}
				<div className="relative flex-1 overflow-hidden py-2">
					{/* Fondu d'entrée, ancré sur ce conteneur (pas sur la largeur du badge) */}
					<div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#161D14] to-transparent z-10" />
					{/* Fondu de sortie */}
					<div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#161D14] to-transparent z-10" />

					<div
						ref={trackRef}
						// w-max : le conteneur flex doit prendre la largeur de SON CONTENU
						// (comme scrollWidth), pas celle de son parent. Sans ça, translateX(-50%)
						// se résout sur la largeur disponible du parent (~1 écran) au lieu de la
						// largeur réelle des 2x100 noms, et l'animation saute au début après
						// avoir à peine parcouru 2-3 producteurs.
						className={`flex items-center gap-4 sm:gap-8 whitespace-nowrap w-max ${duration !== null ? "animate-vendors-ticker" : ""}`}
						style={duration !== null ? { animationDuration: `${duration}s` } : undefined}
					>
						{loopVendors.map((vendor, i) => (
							<Link
								key={`${vendor.id}-${i}`}
								to={`/producers/${vendor.id}`}
								className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-semibold text-emerald-50/90 hover:text-white transition-colors"
							>
								<Sprout className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#31BC2E] flex-shrink-0" />
								{vendor.name}
								<span className="text-emerald-700 ml-3 sm:ml-6">●</span>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default VendorsNewsTicker;
