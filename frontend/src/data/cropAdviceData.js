// Base de connaissances agricoles pour aider les producteurs (saisons, températures,
// besoins de culture et conseils de récolte). Contexte Afrique de l'Ouest / zone soudano-sahélienne.

export const cropCategories = [
	{ value: "cereals", label: "Céréales" },
	{ value: "vegetables", label: "Légumes" },
	{ value: "fruits", label: "Fruits" },
	{ value: "legumes", label: "Légumineuses" },
	{ value: "tubers", label: "Tubercules" },
	{ value: "spices", label: "Épices" },
];

// idealTemp en °C, cycle en jours
export const cropAdviceData = [
	{
		id: "tomate",
		name: "Tomate",
		aliases: ["tomate", "tomates", "tomato"],
		category: "vegetables",
		season: {
			label: "Saison sèche fraîche (contre-saison)",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Avril",
			note: "Éviter le plein cœur de l'hivernage : excès de pluie = maladies fongiques (mildiou).",
		},
		idealTemp: { min: 18, max: 27 },
		water: "Arrosage régulier, sans excès. Pailler le sol pour garder l'humidité et éviter les maladies au contact de la terre.",
		soil: "Sol meuble, riche en matière organique, bien drainé, pH 6-6.8",
		cycleDays: "90 - 120 jours",
		tips: [
			"Tuteurer les plants dès 30 cm pour éviter le contact des fruits avec le sol",
			"Espacer les pieds de 50 à 60 cm pour une bonne aération",
			"Surveiller le mildiou et les chenilles (Helicoverpa) en période humide",
		],
		harvestTips:
			"Récolter quand le fruit change de couleur (vert clair à rouge/orange selon variété), le matin de préférence pour limiter le flétrissement.",
		postHarvest:
			"Conserver à l'ombre, ventilé, 8-10°C idéalement. Éviter l'entassement qui accélère le pourrissement.",
	},
	{
		id: "oignon",
		name: "Oignon",
		aliases: ["oignon", "oignons", "onion"],
		category: "vegetables",
		season: {
			label: "Saison sèche",
			sowing: "Octobre à Novembre (pépinière)",
			harvest: "Février à Avril",
			note: "Culture de contre-saison classique au Sahel, sur périmètre irrigué.",
		},
		idealTemp: { min: 15, max: 25 },
		water: "Irrigation fréquente et régulière, surtout en formation du bulbe. Réduire l'arrosage 2-3 semaines avant récolte.",
		soil: "Sol sablo-limoneux, bien drainé, riche en matière organique, pH 6-7",
		cycleDays: "110 - 150 jours",
		tips: [
			"Repiquer les plants 45 jours après semis en pépinière",
			"Désherber régulièrement, l'oignon supporte mal la concurrence des mauvaises herbes",
			"Surveiller les thrips (petits insectes suceurs) en saison chaude et sèche",
		],
		harvestTips:
			"Récolter quand les feuilles jaunissent et se couchent naturellement.",
		postHarvest:
			"Faire sécher (ressuyage) 1 à 2 semaines à l'ombre avant stockage dans un endroit sec, aéré et frais.",
	},
	{
		id: "pomme-de-terre",
		name: "Pomme de terre",
		aliases: ["pomme de terre", "pommes de terre", "potato"],
		category: "tubers",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Mars",
			note: "Sensible à la chaleur : à éviter en saison chaude (mars-juin).",
		},
		idealTemp: { min: 15, max: 22 },
		water: "Arrosage régulier et constant, surtout à la formation des tubercules. Éviter l'excès d'eau (pourriture).",
		soil: "Sol meuble, bien drainé, riche en potasse, pH 5.5-6.5",
		cycleDays: "90 - 120 jours",
		tips: [
			"Butter les plants (remonter la terre) pour protéger les tubercules de la lumière",
			"Utiliser des semences certifiées pour limiter les maladies",
			"Surveiller le mildiou en période humide",
		],
		harvestTips:
			"Récolter quand le feuillage jaunit et sèche complètement.",
		postHarvest:
			"Stocker au sec, à l'obscurité et au frais (10-15°C) pour éviter la germination et le verdissement.",
	},
	{
		id: "manioc",
		name: "Manioc",
		aliases: ["manioc", "cassava"],
		category: "tubers",
		season: {
			label: "Toute l'année (idéalement en début d'hivernage)",
			sowing: "Mai à Juillet (début des pluies)",
			harvest: "8 à 18 mois après plantation selon variété",
			note: "Culture résistante, tolère bien la sécheresse une fois installée.",
		},
		idealTemp: { min: 25, max: 32 },
		water: "Peu exigeant en eau après installation, mais sensible à la sécheresse durant les 2-3 premiers mois.",
		soil: "S'adapte à des sols pauvres, mais préfère les sols légers et bien drainés",
		cycleDays: "240 - 540 jours (8-18 mois)",
		tips: [
			"Utiliser des boutures saines de 20-25 cm issues de plants vigoureux",
			"Sarcler dans les 3 premiers mois, période critique face aux mauvaises herbes",
			"Éviter les sols gorgés d'eau qui font pourrir les racines",
		],
		harvestTips:
			"Récolte échelonnée possible ; test sur un plant pour vérifier la taille des racines.",
		postHarvest:
			"Se conserve mal frais (2-4 jours) : transformer rapidement (gari, cossette, farine) ou vendre vite après récolte.",
	},
	{
		id: "mais",
		name: "Maïs",
		aliases: ["mais", "maïs", "corn", "mil maïs"],
		category: "cereals",
		season: {
			label: "Hivernage (saison des pluies)",
			sowing: "Juin à Juillet",
			harvest: "Septembre à Novembre",
			note: "Peut aussi se cultiver en contre-saison irriguée dans certaines zones.",
		},
		idealTemp: { min: 20, max: 30 },
		water: "500 à 800 mm sur le cycle, sensible au stress hydrique à la floraison",
		soil: "Sol profond, riche, bien drainé, pH 5.5-7",
		cycleDays: "90 - 120 jours",
		tips: [
			"Semer après les premières pluies installées pour sécuriser la levée",
			"Apporter de l'azote en couverture au stade 6-8 feuilles",
			"Surveiller la chenille légionnaire d'automne (Spodoptera frugiperda)",
		],
		harvestTips:
			"Récolter quand les grains sont durs et les spathes/enveloppes sèches.",
		postHarvest:
			"Bien sécher les épis avant stockage (humidité <14%) pour éviter moisissures et aflatoxines.",
	},
	{
		id: "mil",
		name: "Mil",
		aliases: ["mil", "millet"],
		category: "cereals",
		season: {
			label: "Hivernage (saison des pluies)",
			sowing: "Mai à Juin",
			harvest: "Septembre à Octobre",
			note: "Céréale de base du Sahel, tolérante à la sécheresse et aux sols pauvres.",
		},
		idealTemp: { min: 22, max: 35 },
		water: "300 à 500 mm suffisent, bonne tolérance à la sécheresse",
		soil: "S'adapte aux sols sableux et pauvres, pH 5-7",
		cycleDays: "75 - 120 jours selon variété",
		tips: [
			"Semer en poquets espacés de 80 cm à 1 m",
			"Démariage (éclaircissage) 2-3 semaines après la levée",
			"Surveiller les oiseaux granivores à la maturité",
		],
		harvestTips:
			"Couper les épis quand les grains sont durs et le feuillage sec.",
		postHarvest:
			"Battre et bien sécher au soleil avant stockage en sac ou grenier ventilé.",
	},
	{
		id: "arachide",
		name: "Arachide",
		aliases: ["arachide", "arachides", "groundnut", "peanut"],
		category: "legumes",
		season: {
			label: "Hivernage (saison des pluies)",
			sowing: "Juin à Juillet",
			harvest: "Octobre à Novembre",
			note: "Culture pluviale classique, améliore aussi la fertilité du sol (fixation d'azote).",
		},
		idealTemp: { min: 22, max: 30 },
		water: "500 à 700 mm sur le cycle, sensible au stress hydrique à la floraison/formation des gousses",
		soil: "Sol sableux ou sablo-limoneux, léger, bien drainé, pH 5.5-6.5",
		cycleDays: "90 - 120 jours",
		tips: [
			"Butter légèrement au moment de la floraison pour faciliter la pénétration des gynophores",
			"Rotation avec céréales (mil, maïs) recommandée",
			"Bien sécher après récolte pour éviter l'aflatoxine (champignon toxique)",
		],
		harvestTips:
			"Arracher quand les feuilles jaunissent et les gousses sont bien formées (vérifier par sondage).",
		postHarvest:
			"Sécher au soleil sur bâche ou aire propre plusieurs jours avant stockage, à l'abri de l'humidité.",
	},
	{
		id: "riz",
		name: "Riz",
		aliases: ["riz", "rice"],
		category: "cereals",
		season: {
			label: "Hivernage (pluvial) ou toute l'année (irrigué)",
			sowing: "Juin-Juillet (pluvial) / possible en contre-saison si irrigué",
			harvest: "3 à 4 mois après semis",
			note: "Riz irrigué (vallée du fleuve) permet 2 cycles/an ; riz pluvial dépend des pluies.",
		},
		idealTemp: { min: 20, max: 35 },
		water: "Besoin élevé en eau, submersion contrôlée pour le riz irrigué",
		soil: "Sol argileux ou limono-argileux capable de retenir l'eau",
		cycleDays: "100 - 130 jours",
		tips: [
			"Bien niveler la parcelle pour une irrigation homogène",
			"Repiquage à 15-21 jours après semis en pépinière",
			"Désherber tôt : le riz est très sensible à la concurrence des adventices",
		],
		harvestTips:
			"Récolter quand 80-90% des grains sont dorés/mûrs, en évitant l'excès de maturation (égrenage).",
		postHarvest:
			"Sécher rapidement après battage (humidité <14%) avant stockage pour éviter moisissures.",
	},
	{
		id: "igname",
		name: "Igname",
		aliases: ["igname", "ignames", "yam"],
		category: "tubers",
		season: {
			label: "Hivernage",
			sowing: "Mars à Mai (buttage et plantation)",
			harvest: "Octobre à Décembre (7-10 mois)",
			note: "Nécessite un buttage important et un tuteurage.",
		},
		idealTemp: { min: 25, max: 30 },
		water: "Besoin en eau régulier surtout les 4 premiers mois, sensible à l'excès d'eau stagnante",
		soil: "Sol profond, meuble, riche, bien drainé",
		cycleDays: "210 - 300 jours (7-10 mois)",
		tips: [
			"Butter haut (40-50 cm) pour permettre un bon développement du tubercule",
			"Tuteurer les lianes pour une meilleure photosynthèse",
			"Utiliser des semenceaux sains, désinfectés avant plantation",
		],
		harvestTips:
			"Récolter quand les feuilles jaunissent et sèchent en fin de cycle.",
		postHarvest:
			"Se conserve plusieurs mois dans un lieu sec, aéré et à l'ombre (grenier traditionnel).",
	},
	{
		id: "piment",
		name: "Piment",
		aliases: ["piment", "piments", "pepper", "chili"],
		category: "spices",
		season: {
			label: "Saison sèche ou hivernage (culture possible presque toute l'année si irrigué)",
			sowing: "Toute l'année en pépinière si irrigation disponible",
			harvest: "3 à 4 mois après repiquage, récolte échelonnée",
			note: "Bonne culture de diversification, prix rémunérateur en contre-saison.",
		},
		idealTemp: { min: 20, max: 30 },
		water: "Arrosage régulier et modéré, éviter l'excès d'eau (pourriture racinaire)",
		soil: "Sol meuble, riche, bien drainé, pH 6-6.8",
		cycleDays: "90 - 120 jours (puis récolte étalée sur plusieurs semaines)",
		tips: [
			"Repiquer 4-6 semaines après semis en pépinière",
			"Pailler pour limiter le stress hydrique et les mauvaises herbes",
			"Surveiller pucerons et mouches blanches, vecteurs de virus",
		],
		harvestTips:
			"Récolter progressivement les fruits mûrs (rouge/jaune selon variété) pour stimuler la production.",
		postHarvest:
			"Consommer frais rapidement ou sécher au soleil pour une conservation longue durée.",
	},
	{
		id: "aubergine",
		name: "Aubergine",
		aliases: ["aubergine", "aubergines", "eggplant"],
		category: "vegetables",
		season: {
			label: "Saison sèche ou hivernage",
			sowing: "Toute l'année si irrigation disponible",
			harvest: "3 mois après repiquage, récolte échelonnée",
			note: "Y compris l'aubergine locale (jaxatu) très cultivée au Sénégal.",
		},
		idealTemp: { min: 20, max: 30 },
		water: "Arrosage régulier, sensible au stress hydrique pendant la floraison",
		soil: "Sol riche en matière organique, bien drainé, pH 6-6.8",
		cycleDays: "80 - 100 jours",
		tips: [
			"Espacer les plants de 60-80 cm",
			"Surveiller les doryphores et pucerons",
			"Tuteurer si production abondante pour éviter la casse des branches",
		],
		harvestTips:
			"Récolter les fruits encore fermes et brillants, avant qu'ils ne deviennent ternes ou trop gros.",
		postHarvest:
			"Se conserve quelques jours à température ambiante, à l'ombre, ne pas empiler.",
	},
	{
		id: "gombo",
		name: "Gombo",
		aliases: ["gombo", "gombos", "okra"],
		category: "vegetables",
		season: {
			label: "Hivernage principalement",
			sowing: "Mai à Juillet",
			harvest: "2 mois après semis, récolte échelonnée plusieurs semaines",
			note: "Culture facile et résistante à la chaleur.",
		},
		idealTemp: { min: 22, max: 32 },
		water: "Modéré, tolère bien la chaleur mais craint la stagnation d'eau",
		soil: "S'adapte à divers types de sols, préfère les sols légers et drainés",
		cycleDays: "55 - 65 jours",
		tips: [
			"Semer en poquets espacés de 40-50 cm",
			"Récolter fréquemment (tous les 2-3 jours) pour prolonger la production",
			"Surveiller les pucerons et la mouche blanche",
		],
		harvestTips:
			"Cueillir les fruits jeunes et tendres (5-10 cm), ils deviennent fibreux en vieillissant.",
		postHarvest:
			"Très périssable : vendre ou transformer (séchage) rapidement après récolte.",
	},
	{
		id: "chou",
		name: "Chou",
		aliases: ["chou", "choux", "cabbage"],
		category: "vegetables",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Mars",
			note: "Craint fortement la chaleur, à réserver à la période fraîche de l'année.",
		},
		idealTemp: { min: 15, max: 22 },
		water: "Arrosage régulier et abondant, surtout à la formation de la pomme",
		soil: "Sol riche, bien drainé, pH 6-6.8",
		cycleDays: "70 - 100 jours",
		tips: [
			"Repiquer les plants 4-5 semaines après semis en pépinière",
			"Surveiller la chenille du chou (Plutella) et les pucerons",
			"Fertiliser en azote pour un bon développement foliaire",
		],
		harvestTips:
			"Récolter quand la pomme est ferme et compacte au toucher.",
		postHarvest:
			"Conserver au frais et à l'ombre, se garde 1-2 semaines.",
	},
	{
		id: "carotte",
		name: "Carotte",
		aliases: ["carotte", "carottes", "carrot"],
		category: "vegetables",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Mars",
			note: "Sensible à la chaleur excessive qui provoque la montée à graine.",
		},
		idealTemp: { min: 16, max: 24 },
		water: "Arrosage léger et régulier, surtout à la levée",
		soil: "Sol meuble, profond, sans cailloux, bien drainé, pH 6-6.8",
		cycleDays: "70 - 90 jours",
		tips: [
			"Semer directement en place (la carotte supporte mal le repiquage)",
			"Éclaircir tôt pour éviter des racines déformées",
			"Désherber régulièrement, la levée est lente",
		],
		harvestTips:
			"Récolter quand les racines atteignent la taille souhaitée, avant qu'elles ne deviennent fibreuses.",
		postHarvest:
			"Couper les fanes, conserver au frais et humide pour éviter le flétrissement.",
	},
	{
		id: "haricot-vert",
		name: "Haricot vert",
		aliases: ["haricot vert", "haricots verts", "green bean"],
		category: "legumes",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Décembre à Février",
			note: "Culture d'exportation courante en contre-saison au Sénégal.",
		},
		idealTemp: { min: 18, max: 26 },
		water: "Arrosage régulier, sensible au stress hydrique à la floraison",
		soil: "Sol léger, bien drainé, riche en matière organique, pH 6-6.8",
		cycleDays: "55 - 70 jours",
		tips: [
			"Utiliser des semences certifiées pour l'exportation",
			"Surveiller les thrips et acariens en saison chaude",
			"Tuteurer les variétés grimpantes",
		],
		harvestTips:
			"Récolter jeune, gousses tendres, avant le développement des graines.",
		postHarvest:
			"Refroidir rapidement après récolte (chaîne du froid) pour préserver la fraîcheur, notamment pour l'export.",
	},
	{
		id: "banane",
		name: "Banane",
		aliases: ["banane", "bananes", "banana"],
		category: "fruits",
		season: {
			label: "Production toute l'année (zones irriguées/humides)",
			sowing: "Plantation en début d'hivernage idéalement",
			harvest: "9 à 12 mois après plantation, puis production continue",
			note: "Culture pérenne, nécessite une bonne disponibilité en eau toute l'année.",
		},
		idealTemp: { min: 24, max: 32 },
		water: "Besoin élevé et constant en eau (irrigation en saison sèche)",
		soil: "Sol profond, riche, bien drainé, pH 6-7",
		cycleDays: "270 - 365 jours pour le premier cycle",
		tips: [
			"Protéger du vent (brise-vent) pour éviter la casse des plants",
			"Éliminer les rejets excédentaires pour concentrer la vigueur",
			"Surveiller le charançon du bananier et la cercosporiose",
		],
		harvestTips:
			"Couper le régime quand les doigts sont bien remplis mais encore verts.",
		postHarvest:
			"Laisser mûrir à température ambiante à l'abri du soleil direct, manipuler avec précaution (fruit fragile).",
	},
	{
		id: "mangue",
		name: "Mangue",
		aliases: ["mangue", "mangues", "mango"],
		category: "fruits",
		season: {
			label: "Récolte en saison chaude, avant l'hivernage",
			sowing: "Culture pérenne (arbre), plantation en début d'hivernage",
			harvest: "Mars à Juillet selon variété et zone",
			note: "Arbre fruitier majeur du Sénégal, forte activité d'exportation en saison.",
		},
		idealTemp: { min: 24, max: 35 },
		water: "Peu exigeant une fois établi, arrosage nécessaire en jeune âge et floraison en année sèche",
		soil: "S'adapte à de nombreux sols, préfère les sols profonds bien drainés",
		cycleDays: "3 à 5 ans avant la première production, puis récolte annuelle",
		tips: [
			"Tailler après récolte pour aérer l'arbre et stimuler la fructification",
			"Surveiller la mouche des fruits (Bactrocera dorsalis), ravageur majeur à l'export",
			"Traitement anti-anthracnose en période humide",
		],
		harvestTips:
			"Récolter à maturité physiologique (léger changement de couleur), avec le pédoncule pour limiter l'écoulement de sève.",
		postHarvest:
			"Traitement à l'eau chaude possible pour l'export, stockage frais (10-13°C) pour prolonger la conservation.",
	},
	{
		id: "papaye",
		name: "Papaye",
		aliases: ["papaye", "papayes", "papaya"],
		category: "fruits",
		season: {
			label: "Production toute l'année",
			sowing: "Plantation en début d'hivernage de préférence",
			harvest: "8 à 10 mois après plantation, puis en continu",
			note: "Croissance rapide, bon revenu de diversification.",
		},
		idealTemp: { min: 22, max: 32 },
		water: "Arrosage régulier, sensible à l'excès d'eau stagnante (pourriture du collet)",
		soil: "Sol léger, bien drainé, riche en matière organique, pH 6-6.5",
		cycleDays: "240 - 300 jours",
		tips: [
			"Planter sur billons ou buttes pour éviter l'engorgement d'eau",
			"Espacer les plants de 2-3 m",
			"Surveiller les virus transmis par pucerons",
		],
		harvestTips:
			"Récolter quand la peau commence à jaunir à la base du fruit.",
		postHarvest:
			"Manipuler avec soin (fruit fragile), conserver à température ambiante ou au frais pour prolonger la durée.",
	},
	{
		id: "pasteque",
		name: "Pastèque",
		aliases: ["pasteque", "pastèque", "pasteques", "pastèques", "watermelon"],
		category: "fruits",
		season: {
			label: "Saison sèche ou début d'hivernage",
			sowing: "Février à Avril (irrigué) ou Juin (pluvial)",
			harvest: "3 mois après semis",
			note: "Forte demande en saison chaude, culture peu exigeante sur sol sableux.",
		},
		idealTemp: { min: 22, max: 32 },
		water: "Modéré mais régulier, réduire l'arrosage en fin de cycle pour améliorer le sucre",
		soil: "Sol sableux ou sablo-limoneux, bien drainé",
		cycleDays: "80 - 100 jours",
		tips: [
			"Espacer largement les plants (2 m) car la culture est rampante",
			"Pailler pour limiter le contact des fruits avec le sol humide",
			"Surveiller l'oïdium en fin de cycle",
		],
		harvestTips:
			"Vérifier la maturité par le son creux au toucher et le dessèchement de la vrille proche du fruit.",
		postHarvest:
			"Se conserve plusieurs semaines dans un lieu frais et sec, manipuler sans choc.",
	},
	{
		id: "niebe",
		name: "Niébé (haricot local)",
		aliases: ["niebe", "niébé", "haricot niebe", "cowpea"],
		category: "legumes",
		season: {
			label: "Hivernage",
			sowing: "Juin à Juillet",
			harvest: "Septembre à Octobre (2-3 mois)",
			note: "Légumineuse résistante à la sécheresse, améliore la fertilité du sol.",
		},
		idealTemp: { min: 20, max: 32 },
		water: "Faible besoin en eau, bonne résistance à la sécheresse",
		soil: "S'adapte aux sols pauvres et sableux, pH 5.5-7",
		cycleDays: "60 - 90 jours",
		tips: [
			"Rotation avec céréales recommandée (fixation d'azote)",
			"Surveiller les pucerons et la punaise suceuse de gousses",
			"Récolte échelonnée possible selon la floraison",
		],
		harvestTips:
			"Récolter quand les gousses sont sèches et cassantes.",
		postHarvest:
			"Bien sécher avant stockage, traiter contre la bruche (insecte ravageur des graines stockées).",
	},
];

// Cherche une fiche de conseils correspondant à un nom de produit (ex: nom saisi par le producteur)
export const findCropAdviceByName = (productName = "") => {
	if (!productName) return null;
	const normalized = productName
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.trim();

	return (
		cropAdviceData.find((crop) =>
			crop.aliases.some((alias) => {
				const normalizedAlias = alias
					.toLowerCase()
					.normalize("NFD")
					.replace(/[̀-ͯ]/g, "");
				return (
					normalized.includes(normalizedAlias) ||
					normalizedAlias.includes(normalized)
				);
			})
		) || null
	);
};

export const searchCropAdvice = (query = "") => {
	if (!query) return cropAdviceData;
	const normalized = query
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.trim();

	return cropAdviceData.filter((crop) => {
		const name = crop.name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[̀-ͯ]/g, "");
		return (
			name.includes(normalized) ||
			crop.aliases.some((alias) => alias.includes(normalized))
		);
	});
};

export default cropAdviceData;
