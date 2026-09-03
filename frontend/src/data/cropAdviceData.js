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

export const defaultGrowthStages = [
	{
		id: "semis",
		phase: "Étape 1",
		name: "Semis & Pépinière",
		period: "Début de cycle (Jours 1 - 25)",
		image: "/images/stages/semis_pepiniere.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
		description: "Sélection des semences saines, préparation des composts/planches et arrosage délicat des jeunes pousses.",
	},
	{
		id: "croissance",
		phase: "Étape 2",
		name: "Croissance Végétative",
		period: "Milieu de cycle (Jours 25 - 60)",
		image: "/images/stages/croissance_vegetative.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
		description: "Développement actif du feuillage et des racines, sarclage, buttage et apport d'engrais organique.",
	},
	{
		id: "floraison",
		phase: "Étape 3",
		name: "Floraison & Fructification",
		period: "Stade critique (Jours 60 - 90)",
		image: "/images/stages/floraison_fructification.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
		description: "Apparition des fleurs et formation des fruits ou tubercules. Maintien d'une irrigation constante sans excès.",
	},
	{
		id: "recolte",
		phase: "Étape 4",
		name: "Récolte & Maturité",
		period: "Fin de cycle (Jours 90 - 120)",
		image: "/images/stages/recolte_maturite.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80",
		description: "Collecte manuelle ou mécanique des récoltes mûres à la fraîcheur du matin, suivie du tri et séchage.",
	},
];

export const equipmentCatalog = [
	{
		keywords: ["houe", "daba", "binette", "machette", "râteau"],
		name: "Outillage Manuel (Daba & Houe)",
		category: "Préparation & Entretien",
		image: "/images/equipment/daba_outils.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["tuteur", "tuteurs", "étançon", "étançons", "lianes"],
		name: "Tuteurs Bambou & Bois",
		category: "Support de croissance",
		image: "/images/equipment/tuteurs.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["goutte-à-goutte", "goutte à goutte"],
		name: "Système Goutte-à-Goutte",
		category: "Irrigation localisée",
		image: "/images/equipment/irrigation_goutte.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["motopompe", "pompe", "submersion", "canal"],
		name: "Motopompe d'Irrigation",
		category: "Pompage de l'eau",
		image: "/images/equipment/motopompe.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["aspersion", "arrosoir"],
		name: "Système d'Arrosage & Aspersion",
		category: "Gestion de l'eau",
		image: "/images/equipment/aspersion.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["pulvérisateur", "pulverisateur", "traitements", "phytosanitaire"],
		name: "Pulvérisateur agricole à dos",
		category: "Protection des Cultures",
		image: "/images/equipment/pulverisateur.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["tracteur", "charrue", "labour"],
		name: "Tracteur & Labour",
		category: "Motorisation & Labour",
		image: "/images/equipment/tracteur_motoculteur.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1530267981675-7ab3f16787c8?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["motoculteur", "billonnage", "billon", "buttage"],
		name: "Motoculteur de Billonnage",
		category: "Motorisation & Buttage",
		image: "/images/equipment/motoculteur_billonnage.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1530267981675-7ab3f16787c8?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["semoir", "repiqueuse", "plantation"],
		name: "Semoir & Matériel de Plantation",
		category: "Semis & Repiquage",
		image: "/images/equipment/semoir_charrue.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
	},
	{
		keywords: ["moissonneuse", "batteuse", "égrenage", "arracheuse", "faucille", "caisses"],
		name: "Équipement de Récolte & Battage",
		category: "Récolte & Conditionnement",
		image: "/images/equipment/moissonneuse_batteuse.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
	},
];

// idealTemp en °C, cycle en jours
export const cropAdviceData = [
	{
		id: "tomate",
		name: "Tomate",
		aliases: ["tomate", "tomates", "tomato"],
		category: "vegetables",
		image: "/images/tomate/hero.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
		season: {
			label: "Saison sèche fraîche (contre-saison)",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Avril",
			note: "Éviter le plein cœur de l'hivernage : excès de pluie = maladies fongiques (mildiou).",
		},
		idealTemp: { min: 18, max: 27 },
		water: "Arrosage régulier, sans excès. Pailler le sol pour garder l'humidité et éviter les maladies au contact de la terre.",
		soil: "Sol meuble, riche en matière organique, bien drainé, pH 6-6.8",
		equipmentDetails: [
			{
				name: "Houe & Daba de préparation",
				category: "Préparation du sol",
				image: "/images/tomate/equip_daba.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
				description: "Confection des billons surélevés et ameublissement profond du sol.",
			},
			{
				name: "Tuteurs Bambou & Bois (1.5m)",
				category: "Support de croissance",
				image: "/images/tomate/equip_tuteurs.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80",
				description: "Maintien des tiges verticales pour éviter le contact des fruits avec la terre humide.",
			},
			{
				name: "Système Goutte-à-Goutte",
				category: "Irrigation localisée",
				image: "/images/tomate/equip_goutte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
				description: "Arrosage direct au pied évitant l'aspersion sur les feuilles (anti-mildiou).",
			},
			{
				name: "Pulvérisateur à dos",
				category: "Protection phytosanitaire",
				image: "/images/tomate/equip_pulverisateur.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
				description: "Traitements préventifs bio (neem, bouillie bordelaise) contre chenilles et mildiou.",
			},
		],
		fertilizer:
			"Fumier bien décomposé au labour, puis apport NPK équilibré en cours de cycle. Un complément calcique aide à éviter la pourriture apicale des fruits.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Semis & Pépinière de Tomates",
				period: "Jour 1 à 25",
				image: "/images/tomate/stage_semis.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
				description: "Semis en caissettes ombragées. Germination des graines et apparition des premières jeunes pousses de tomates.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Repiquage & Tuteurage",
				period: "Jour 25 à 55",
				image: "/images/tomate/stage_croissance.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80",
				description: "Repiquage au champ à 50 cm d'intervalle. Pose des tuteurs et ébourgeonnage (suppression des gourmands).",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Formation des Fruits Verts",
				period: "Jour 55 à 85",
				image: "/images/tomate/stage_floraison.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1596196507371-209028882583?auto=format&fit=crop&w=800&q=80",
				description: "Apparition des petites fleurs jaunes et grossissement des grappes de tomates encore vertes.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Récolte des Tomates Rouges",
				period: "Jour 85 à 120",
				image: "/images/tomate/stage_recolte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1576181256399-83563454b679?auto=format&fit=crop&w=800&q=80",
				description: "Ceuillette manuelle des tomates rouges et fermes. Conditionnement délicat dans des cagettes aérées.",
			},
		],
	},
	{
		id: "oignon",
		name: "Oignon",
		aliases: ["oignon", "oignons", "onion"],
		category: "vegetables",
		image: "/images/crops/oignon.png",
		fallbackUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche",
			sowing: "Octobre à Novembre (pépinière)",
			harvest: "Février à Avril",
			note: "Culture de contre-saison classique au Sahel, sur périmètre irrigué.",
		},
		idealTemp: { min: 15, max: 25 },
		water: "Irrigation fréquente et régulière, surtout en formation du bulbe. Réduire l'arrosage 2-3 semaines avant récolte.",
		soil: "Sol sablo-limoneux, bien drainé, riche en matière organique, pH 6-7",
		equipment: [
			"Houe pour la préparation des planches",
			"Motopompe ou système d'irrigation goutte-à-goutte",
			"Arrosoir pour la pépinière",
			"Pulvérisateur à dos",
		],
		fertilizer:
			"Fumier organique avant semis, puis engrais riche en potasse à la formation du bulbe pour améliorer la conservation.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Pépinière (45 jours)",
				period: "Octobre - Novembre",
				image: "/images/oignon/stage_semis.jpg",
				description: "Semis dense en planches affinées et désinfectées. Arrosage régulier à l'arrosoir fine pomme.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Repiquage & Feuillage",
				period: "Décembre - Janvier",
				image: "/images/oignon/stage_croissance.jpg",
				description: "Habillage des racines et repiquage en lignes espacées de 15 cm. Sarclages fréquents.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Bulbification",
				period: "Février - Mars",
				image: "/images/oignon/stage_floraison.jpg",
				description: "Grossissement des bulbes. Arrosage abondant et soutien potassique.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Maturité & Ressuyage",
				period: "Mars - Avril",
				image: "/images/oignon/stage_recolte.jpg",
				description: "Arrêt de l'arrosage, tombaison des fanes et séchage au soleil avant mise en sacs aérés.",
			},
		],
	},
	{
		id: "pomme-de-terre",
		name: "Pomme de terre",
		aliases: ["pomme de terre", "pommes de terre", "potato"],
		category: "tubers",
		image: "/images/crops/pomme-de-terre.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=1200&q=80",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Mars",
			note: "Sensible à la chaleur : à éviter en saison chaude (mars-juin).",
		},
		idealTemp: { min: 15, max: 22 },
		water: "Arrosage régulier et constant, surtout à la formation des tubercules. Éviter l'excès d'eau (pourriture).",
		soil: "Sol meuble, bien drainé, riche en potasse, pH 5.5-6.5",
		equipment: [
			"Houe/daba pour le buttage",
			"Charrue à traction animale ou motoculteur pour les grandes surfaces",
			"Pulvérisateur à dos",
			"Arrosoir ou système d'irrigation",
		],
		fertilizer:
			"Fumier organique au labour, complété par un engrais riche en potasse qui favorise la formation des tubercules.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Préparation des semences",
				period: "Semaine 1",
				image: "/images/pomme-de-terre/stage_semis.jpg",
				description: "Sélection de plants germés sains, triés en caisses aérées avant la mise en terre.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Plantation en billons",
				period: "Semaines 2 à 4",
				image: "/images/pomme-de-terre/stage_croissance.jpg",
				description: "Mise en terre des plants germés en lignes espacées, sur billons pour faciliter le buttage.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Buttage",
				period: "Semaines 5 à 9",
				image: "/images/pomme-de-terre/stage_floraison.jpg",
				description: "Apparition des fleurs blanches, signe de la formation des tubercules. Buttage pour les protéger de la lumière.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Récolte",
				period: "Semaines 10 à 16",
				image: "/images/pomme-de-terre/stage_recolte.jpg",
				description: "Arrachage des tubercules quand le feuillage jaunit et sèche, tri et mise en caisses aérées.",
			},
		],
	},
	{
		id: "manioc",
		name: "Manioc",
		aliases: ["manioc", "cassava"],
		category: "tubers",
		image: "/images/crops/manioc.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80",
		season: {
			label: "Toute l'année (idéalement en début d'hivernage)",
			sowing: "Mai à Juillet (début des pluies)",
			harvest: "8 à 18 mois après plantation selon variété",
			note: "Culture résistante, tolère bien la sécheresse une fois installée.",
		},
		idealTemp: { min: 25, max: 32 },
		water: "Peu exigeant en eau après installation, mais sensible à la sécheresse durant les 2-3 premiers mois.",
		soil: "S'adapte à des sols pauvres, mais préfère les sols légers et bien drainés",
		equipment: [
			"Daba/houe pour le buttage et le sarclage",
			"Machette pour couper et préparer les boutures",
			"Charrue à traction animale pour les grandes parcelles",
		],
		fertilizer:
			"Culture peu exigeante : un apport de fumier organique au labour suffit généralement, sans besoin d'engrais minéral important.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Préparation des boutures",
				period: "Semaine 1",
				image: "/images/manioc/stage_semis.jpg",
				description: "Sélection de tiges saines et vigoureuses, découpées en boutures de 20-25 cm à la machette.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Plantation des boutures",
				period: "Semaines 1 à 2",
				image: "/images/manioc/stage_croissance.jpg",
				description: "Mise en terre en billons, boutures plantées légèrement inclinées pour favoriser l'enracinement.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Croissance & Développement",
				period: "Mois 2 à 8",
				image: "/images/manioc/stage_floraison.jpg",
				description: "Développement du feuillage et formation des racines tubéreuses sous terre. Sarclages réguliers.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Récolte",
				period: "8 à 18 mois selon variété",
				image: "/images/manioc/stage_recolte.jpg",
				description: "Arrachage des racines à maturité, tri et transport rapide vers la transformation ou la vente.",
			},
		],
	},
	{
		id: "mais",
		name: "Maïs",
		aliases: ["mais", "maïs", "corn", "mil maïs"],
		category: "cereals",
		image: "/images/mais/hero.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage (saison des pluies)",
			sowing: "Juin à Juillet",
			harvest: "Septembre à Novembre",
			note: "Peut aussi se cultiver en contre-saison irriguée dans certaines zones.",
		},
		idealTemp: { min: 20, max: 30 },
		water: "500 à 800 mm sur le cycle, sensible au stress hydrique à la floraison",
		soil: "Sol profond, riche, bien drainé, pH 5.5-7",
		equipment: [
			"Semoir manuel ou à traction animale",
			"Tracteur pour le labour sur grandes surfaces",
			"Pulvérisateur à dos ou à moteur",
			"Moissonneuse ou matériel d'égrenage pour la récolte",
		],
		fertilizer:
			"Engrais NPK au semis, complété par un apport d'urée en couverture au stade 6-8 feuilles pour soutenir la croissance.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Semis",
				period: "Juin - Juillet",
				image: "/images/mais/stage_semis.jpg",
				description: "Semis des grains en poquets après les premières pluies installées, pour sécuriser la levée.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Croissance & Irrigation",
				period: "Semaines 3 à 8",
				image: "/images/mais/stage_croissance.jpg",
				description: "Développement du feuillage, apport d'azote en couverture au stade 6-8 feuilles, arrosage régulier.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Formation des épis",
				period: "Semaines 8 à 12",
				image: "/images/mais/stage_floraison.jpg",
				description: "Apparition de la panicule mâle et des soies sur l'épi. Stade critique pour le stress hydrique.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Récolte",
				period: "Septembre à Novembre",
				image: "/images/mais/stage_recolte.jpg",
				description: "Récolte quand les grains sont durs et les spathes sèches, épis triés en cagettes ou paniers.",
			},
		],
	},
	{
		id: "mil",
		name: "Mil",
		aliases: ["mil", "millet"],
		category: "cereals",
		image: "/images/mil/hero.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage (saison des pluies)",
			sowing: "Mai à Juin",
			harvest: "Septembre à Octobre",
			note: "Céréale de base du Sahel, tolérante à la sécheresse et aux sols pauvres.",
		},
		idealTemp: { min: 22, max: 35 },
		water: "300 à 500 mm suffisent, bonne tolérance à la sécheresse",
		soil: "S'adapte aux sols sableux et pauvres, pH 5-7",
		equipment: [
			"Houe/daba ou semoir manuel",
			"Tracteur ou traction animale pour les grandes surfaces",
			"Faucille pour la coupe des épis",
		],
		fertilizer:
			"Peu exigeant en engrais minéral : un apport de fumier organique avant semis améliore sensiblement le rendement.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Semis en poquets",
				period: "Mai - Juin",
				image: "/images/mil/stage_semis.jpg",
				description: "Semis en poquets espacés de 80 cm à 1 m, sur sol sableux préparé.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Croissance & Démariage",
				period: "Semaines 3 à 6",
				image: "/images/mil/stage_croissance.jpg",
				description: "Démariage (éclaircissage) des plants et irrigation d'appoint si disponible.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Formation de l'épi",
				period: "Semaines 7 à 10",
				image: "/images/mil/stage_floraison.jpg",
				description: "Formation caractéristique de l'épi cylindrique du mil. Surveillance des oiseaux granivores.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Récolte & Battage",
				period: "Septembre - Octobre",
				image: "/images/mil/stage_recolte.jpg",
				description: "Coupe des épis à maturité, battage et séchage au soleil avant stockage en grenier ventilé.",
			},
		],
	},
	{
		id: "arachide",
		name: "Arachide",
		aliases: ["arachide", "arachides", "groundnut", "peanut"],
		category: "legumes",
		image: "/images/arachide/hero.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage (saison des pluies)",
			sowing: "Juin à Juillet",
			harvest: "Octobre à Novembre",
			note: "Culture pluviale classique, améliore aussi la fertilité du sol (fixation d'azote).",
		},
		idealTemp: { min: 22, max: 30 },
		water: "500 à 700 mm sur le cycle, sensible au stress hydrique à la floraison/formation des gousses",
		soil: "Sol sableux ou sablo-limoneux, léger, bien drainé, pH 5.5-6.5",
		equipment: [
			"Semoir manuel ou à traction animale",
			"Houe pour le buttage léger",
			"Arracheuse ou matériel de récolte manuelle",
		],
		fertilizer:
			"Besoin en azote limité (la plante fixe l'azote de l'air) ; un apport de phosphore favorise la formation des gousses.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Semis",
				period: "Juin - Juillet",
				image: "/images/arachide/stage_semis.jpg",
				description: "Semis des graines décortiquées en poquets, sur sol sableux léger.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Croissance végétative",
				period: "Semaines 3 à 6",
				image: "/images/arachide/stage_croissance.jpg",
				description: "Développement du feuillage en rangs. Désherbage et buttage léger.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Formation des gousses",
				period: "Semaines 6 à 10",
				image: "/images/arachide/stage_floraison.jpg",
				description: "Floraison jaune caractéristique, pénétration des gynophores dans le sol pour former les gousses.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Récolte",
				period: "Octobre - Novembre",
				image: "/images/arachide/stage_recolte.jpg",
				description: "Arrachage quand les feuilles jaunissent, séchage au soleil avant stockage à l'abri de l'humidité.",
			},
		],
	},
	{
		id: "riz",
		name: "Riz",
		aliases: ["riz", "rice"],
		category: "cereals",
		image: "/images/crops/riz.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage (pluvial) ou toute l'année (irrigué)",
			sowing: "Juin-Juillet (pluvial) / possible en contre-saison si irrigué",
			harvest: "3 à 4 mois après semis",
			note: "Riz irrigué (vallée du fleuve) permet 2 cycles/an ; riz pluvial dépend des pluies.",
		},
		idealTemp: { min: 20, max: 35 },
		water: "Besoin élevé en eau, submersion contrôlée pour le riz irrigué",
		soil: "Sol argileux ou limono-argileux capable de retenir l'eau",
		equipment: [
			"Charrue ou motoculteur pour le labour",
			"Planche à niveler pour une irrigation homogène",
			"Repiqueuse ou matériel de repiquage manuel",
			"Moissonneuse-batteuse ou faucille selon l'échelle",
		],
		equipmentDetails: [
			{
				name: "Tracteur & Labour",
				category: "Motorisation & Labour",
				image: "/images/equipment/tracteur_motoculteur.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1530267981675-7ab3f16787c8?auto=format&fit=crop&w=800&q=80",
				description: "Labour profond de la rizière pour un sol meuble homogène, suivi d'un planage pour une irrigation uniforme.",
			},
			{
				name: "Motopompe d'Irrigation",
				category: "Pompage de l'eau",
				image: "/images/equipment/motopompe.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
				description: "Pompage de l'eau depuis les forages ou cours d'eau pour alimenter les casiers rizicoles et maintenir la lame d'eau.",
			},
			{
				name: "Semoir & Matériel de Repiquage",
				category: "Semis & Repiquage",
				image: "/images/equipment/semoir_charrue.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
				description: "Repiquage des plants de pépinière en lignes régulières espacées de 20 cm pour optimiser la densité.",
			},
			{
				name: "Moissonneuse-Batteuse & Faucille",
				category: "Récolte & Conditionnement",
				image: "/images/equipment/moissonneuse_batteuse.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
				description: "Coupe et battage des épis à maturité ; la faucille reste utilisée sur les petites parcelles familiales.",
			},
		],
		fertilizer:
			"NPK au repiquage, puis urée fractionnée aux stades tallage et montaison pour maximiser le rendement en grains.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Pépinière & Semis",
				period: "Juin - Juillet (Jours 1 - 21)",
				image: "/images/riz/stage_semis.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1625246333195-78d73c5eb7cd?auto=format&fit=crop&w=800&q=80",
				description: "Semis dense en pépinière inondée. Germination des graines et développement des jeunes plants prêts pour le repiquage.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Repiquage & Tallage",
				period: "Jours 21 à 60",
				image: "/images/riz/stage_croissance.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
				description: "Repiquage en lignes dans la rizière inondée. Développement des talles (tiges secondaires) et apport d'urée pour soutenir la croissance.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Montaison & Épiaison",
				period: "Jours 60 à 100",
				image: "/images/riz/stage_floraison.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
				description: "Montée en épi (montaison) et apparition des panicules chargés de grains en formation. Stade critique pour le remplissage des grains.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Maturité & Récolte",
				period: "Jours 100 à 130",
				image: "/images/riz/stage_recolte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=800&q=80",
				description: "Grains dorés et panicules courbées sous le poids. Coupe à la faucille ou à la moissonneuse, battage et séchage immédiat.",
			},
		],
	},
	{
		id: "igname",
		name: "Igname",
		aliases: ["igname", "ignames", "yam"],
		category: "tubers",
		image: "/images/crops/igname.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage",
			sowing: "Mars à Mai (buttage et plantation)",
			harvest: "Octobre à Décembre (7-10 mois)",
			note: "Nécessite un buttage important et un tuteurage.",
		},
		idealTemp: { min: 25, max: 30 },
		water: "Besoin en eau régulier surtout les 4 premiers mois, sensible à l'excès d'eau stagnante",
		soil: "Sol profond, meuble, riche, bien drainé",
		equipment: [
			"Daba/houe pour un buttage important (40-50 cm)",
			"Tuteurs en bois ou lianes",
			"Machette pour la préparation des semenceaux",
		],
		equipmentDetails: [
			{
				name: "Houe & Daba de Buttage",
				category: "Préparation & Buttage",
				image: "/images/equipment/daba_outils.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
				description: "Confection des buttes volumineuses de terre meuble (40 à 50 cm) nécessaires à l'épanouissement des tubercules.",
			},
			{
				name: "Tuteurs Bambou & Bois",
				category: "Support de croissance",
				image: "/images/equipment/tuteurs.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80",
				description: "Pose des tuteurs robustes pour guider les lianes volubiles vers la lumière et maximiser la photosynthèse.",
			},
			{
				name: "Motoculteur de Billonnage",
				category: "Motorisation & Buttage",
				image: "/images/equipment/motoculteur_billonnage.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1530267981675-7ab3f16787c8?auto=format&fit=crop&w=800&q=80",
				description: "Ameublissement profond et façonnage mécanique des billons surélevés sur les moyennes et grandes parcelles.",
			},
			{
				name: "Pulvérisateur agricole à dos",
				category: "Protection des Cultures",
				image: "/images/equipment/pulverisateur.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
				description: "Traitements préventifs bio et purins foliaires contre l'anthracnose et les maladies cryptogamiques.",
			},
		],
		fertilizer:
			"Fumier bien décomposé au buttage ; éviter les excès d'azote qui favorisent le feuillage au détriment du tubercule.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Préparation & Plantation des Semenceaux",
				period: "Mars - Mai (Jours 1 - 30)",
				image: "/images/igname/stage_semis.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
				description: "Sélection et découpe des semenceaux sains, désinfection naturelle à la cendre et plantation sur les buttes.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Levée & Tuteurage des Lianes",
				period: "Mois 1 à 3",
				image: "/images/igname/stage_croissance.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
				description: "Émergence des premières tiges grimpantes, pose des tuteurs de bambou et premier sarclage minutieux.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Développement Végétatif & Grossissement",
				period: "Mois 3 à 6",
				image: "/images/igname/stage_floraison.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
				description: "Feuillage vigoureux recouvrant les tuteurs et phase intensive de tubérisation sous terre.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Maturité & Récolte des Tubercules",
				period: "Mois 7 à 10 (Octobre - Décembre)",
				image: "/images/igname/stage_recolte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
				description: "Dessèchement des tiges signalant la maturité, déterrage soigné des tubercules à la daba et stockage à l'ombre.",
			},
		],
	},
	{
		id: "piment",
		name: "Piment",
		aliases: ["piment", "piments", "pepper", "chili"],
		category: "spices",
		image: "/images/crops/piment.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche ou hivernage (culture possible presque toute l'année si irrigué)",
			sowing: "Toute l'année en pépinière si irrigation disponible",
			harvest: "3 à 4 mois après repiquage, récolte échelonnée",
			note: "Bonne culture de diversification, prix rémunérateur en contre-saison.",
		},
		idealTemp: { min: 20, max: 30 },
		water: "Arrosage régulier et modéré, éviter l'excès d'eau (pourriture racinaire)",
		soil: "Sol meuble, riche, bien drainé, pH 6-6.8",
		equipment: [
			"Houe pour la préparation du sol",
			"Arrosoir ou système goutte-à-goutte",
			"Pulvérisateur à dos",
			"Tuteurs légers si variété haute",
		],
		equipmentDetails: [
			{
				name: "Système Goutte-à-Goutte",
				category: "Irrigation localisée",
				image: "/images/equipment/irrigation_goutte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80",
				description: "Irrigation au pied régulière et économe en eau évitant l'humidité foliaire propice aux maladies.",
			},
			{
				name: "Pulvérisateur agricole à dos",
				category: "Protection des Cultures",
				image: "/images/equipment/pulverisateur.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
				description: "Traitements biologiques contre pucerons, aleurodes et acariens fréquents sur le piment.",
			},
			{
				name: "Houe & Daba de billonnage",
				category: "Préparation du sol",
				image: "/images/equipment/daba_outils.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
				description: "Confection des planches et billons meubles pour un bon drainage des racines.",
			},
			{
				name: "Tuteurs Bambou & Bois",
				category: "Support de croissance",
				image: "/images/equipment/tuteurs.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=800&q=80",
				description: "Maintien des branches chargées de fruits pour éviter la casse lors des fortes fructifications.",
			},
		],
		fertilizer:
			"Fumier organique puis engrais NPK équilibré, avec un complément potassique à la fructification pour des fruits de qualité.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Pépinière & Semis",
				period: "Jours 1 à 30",
				image: "/images/piment/stage_semis.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
				description: "Semis en pépinière abritée et arrosage fin jusqu'au stade 4 à 6 feuilles vraies.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Repiquage & Croissance Végétative",
				period: "Jours 30 à 60",
				image: "/images/piment/stage_croissance.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
				description: "Repiquage en lignes espacées de 50 cm, paillage au sol et apports organiques.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Fructification",
				period: "Jours 60 à 90",
				image: "/images/piment/stage_floraison.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
				description: "Floraison blanche suivie de la nouaison des petits piments verts.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Maturité & Récoltes Échelonnées",
				period: "Jours 90 à 150+",
				image: "/images/piment/stage_recolte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
				description: "Cueillette régulière des fruits mûrs (rouges ou jaunes) tous les 3 à 5 jours.",
			},
		],
	},
	{
		id: "aubergine",
		name: "Aubergine",
		aliases: ["aubergine", "aubergines", "eggplant"],
		category: "vegetables",
		image: "/images/crops/aubergine.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche ou hivernage",
			sowing: "Toute l'année si irrigation disponible",
			harvest: "3 mois après repiquage, récolte échelonnée",
			note: "Y compris l'aubergine locale (jaxatu) très cultivée au Sénégal.",
		},
		idealTemp: { min: 20, max: 30 },
		water: "Arrosage régulier, sensible au stress hydrique pendant la floraison",
		soil: "Sol riche en matière organique, bien drainé, pH 6-6.8",
		equipment: [
			"Houe pour la préparation du sol",
			"Arrosoir ou système d'irrigation",
			"Pulvérisateur à dos",
			"Tuteurs si production abondante",
		],
		fertilizer:
			"Fumier organique au repiquage, complété par un engrais NPK équilibré en cours de cycle.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Pépinière & Semis",
				period: "Jours 1 à 25",
				image: "/images/aubergine/stage_semis.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
				description: "Sélection des semences saines, préparation des composts et des planches de semis, accompagnées d'un arrosage délicat des jeunes pousses d'aubergine.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Repiquage & Croissance Végétative",
				period: "Jours 25 à 60",
				image: "/images/aubergine/stage_croissance.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
				description: "Développement du feuillage et des racines, travaux de sarclage, buttage autour des plants et fertilisation organique pour soutenir la croissance.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Fructification",
				period: "Jours 60 à 90",
				image: "/images/aubergine/stage_floraison.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
				description: "Apparition des petites fleurs et début de formation des fruits d'aubergines, nécessitant une irrigation régulière et constante sans excès d'eau.s.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Maturité & Récoltes Échelonnées",
				period: "Jours 90 à 120",
				image: "/images/aubergine/stage_recolte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
				description: "Récolte manuelle des aubergines mûres à la fraîcheur du matin dans des paniers, suivie du tri et du conditionnement.",
			},
		],
	},
	{
		id: "gombo",
		name: "Gombo",
		aliases: ["gombo", "gombos", "okra"],
		category: "vegetables",
		image: "/images/crops/gombo.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage principalement",
			sowing: "Mai à Juillet",
			harvest: "2 mois après semis, récolte échelonnée plusieurs semaines",
			note: "Culture facile et résistante à la chaleur.",
		},
		idealTemp: { min: 22, max: 32 },
		water: "Modéré, tolère bien la chaleur mais craint la stagnation d'eau",
		soil: "S'adapte à divers types de sols, préfère les sols légers et drainés",
		equipment: [
			"Houe pour la préparation du sol",
			"Arrosoir",
			"Pulvérisateur à dos",
			"Couteau ou sécateur pour la récolte fréquente",
		],
		fertilizer:
			"Culture peu exigeante : un apport de fumier organique au semis suffit généralement.",
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
		growthStages: [
			{
				id: "semis",
				phase: "Étape 1",
				name: "Pépinière & Semis",
				period: "Jours 1 à 25",
				image: "/images/gombo/stage_semis.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
				description: "Sélection des graines saines, préparation des composts et des planches de terre, avec un arrosage délicat des jeunes pousses de gombo.",
			},
			{
				id: "croissance",
				phase: "Étape 2",
				name: "Repiquage & Croissance Végétative",
				period: "Jours 25 à 60",
				image: "/images/gombo/stage_croissance.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
				description: "Développement vigoureux des tiges et des larges feuilles palmées, accompagné des travaux de sarclage, de buttage et d'apport d'engrais organique.",
			},
			{
				id: "floraison",
				phase: "Étape 3",
				name: "Floraison & Fructification",
				period: "Jours 60 à 90",
				image: "/images/gombo/stage_floraison.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
				description: "Stade critique caractérisé par l'apparition des fleurs jaunes au cœur pourpre et le développement des jeunes capsules vertes de gombo, nécessitant un arrosage régulier sans excès.",
			},
			{
				id: "recolte",
				phase: "Étape 4",
				name: "Maturité & Récoltes Échelonnées",
				period: "Jours 90 à 120",
				image: "/images/gombo/stage_recolte.jpg",
				fallbackUrl: "https://images.unsplash.com/photo-1588252303782-7ee9a3d46337?auto=format&fit=crop&w=800&q=80",
				description: "Ceuillette manuelle des capsules tendres et bien mûres à la fraîcheur du matin, suivie de la mise en paniers, du tri et du séchage.",
			},
		],
	},
	{
		id: "chou",
		name: "Chou",
		aliases: ["chou", "choux", "cabbage"],
		category: "vegetables",
		image: "/images/crops/chou.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1598170845058-12db4576905b?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Mars",
			note: "Craint fortement la chaleur, à réserver à la période fraîche de l'année.",
		},
		idealTemp: { min: 15, max: 22 },
		water: "Arrosage régulier et abondant, surtout à la formation de la pomme",
		soil: "Sol riche, bien drainé, pH 6-6.8",
		equipment: [
			"Houe pour la préparation du sol",
			"Arrosoir ou système d'irrigation",
			"Pulvérisateur à dos",
			"Brouette pour le transport à la récolte",
		],
		fertilizer:
			"Fumier organique puis apport d'azote (urée) pour soutenir le développement foliaire et la formation de la pomme.",
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
		image: "/images/crops/carotte.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1447175008436-08417142ea96?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Janvier à Mars",
			note: "Sensible à la chaleur excessive qui provoque la montée à graine.",
		},
		idealTemp: { min: 16, max: 24 },
		water: "Arrosage léger et régulier, surtout à la levée",
		soil: "Sol meuble, profond, sans cailloux, bien drainé, pH 6-6.8",
		equipment: [
			"Houe légère et râteau pour affiner le sol",
			"Arrosoir à pomme fine",
			"Binette pour le désherbage",
		],
		fertilizer:
			"Fumier bien décomposé apporté avant semis (évite les racines fourchues) ; éviter tout apport d'azote frais en cours de cycle.",
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
		image: "/images/crops/haricot-vert.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche fraîche",
			sowing: "Octobre à Décembre",
			harvest: "Décembre à Février",
			note: "Culture d'exportation courante en contre-saison au Sénégal.",
		},
		idealTemp: { min: 18, max: 26 },
		water: "Arrosage régulier, sensible au stress hydrique à la floraison",
		soil: "Sol léger, bien drainé, riche en matière organique, pH 6-6.8",
		equipment: [
			"Houe pour la préparation du sol",
			"Arrosoir ou système d'irrigation",
			"Tuteurs pour les variétés grimpantes",
			"Caisses de récolte ventilées",
		],
		fertilizer:
			"Besoin en azote limité (légumineuse), privilégier un apport phosphore-potasse pour favoriser la floraison et les gousses.",
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
		image: "/images/crops/banane.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Production toute l'année (zones irriguées/humides)",
			sowing: "Plantation en début d'hivernage idéalement",
			harvest: "9 à 12 mois après plantation, puis production continue",
			note: "Culture pérenne, nécessite une bonne disponibilité en eau toute l'année.",
		},
		idealTemp: { min: 24, max: 32 },
		water: "Besoin élevé et constant en eau (irrigation en saison sèche)",
		soil: "Sol profond, riche, bien drainé, pH 6-7",
		equipment: [
			"Machette/serpe pour l'entretien et la récolte",
			"Système d'irrigation (goutte-à-goutte ou canal)",
			"Étançons pour soutenir les régimes lourds",
			"Brouette pour le transport",
		],
		fertilizer:
			"Fumier organique abondant à la plantation, puis apports réguliers en potasse tout au long du cycle de production.",
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
		image: "/images/crops/mangue.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Récolte en saison chaude, avant l'hivernage",
			sowing: "Culture pérenne (arbre), plantation en début d'hivernage",
			harvest: "Mars à Juillet selon variété et zone",
			note: "Arbre fruitier majeur du Sénégal, forte activité d'exportation en saison.",
		},
		idealTemp: { min: 24, max: 35 },
		water: "Peu exigeant une fois établi, arrosage nécessaire en jeune âge et floraison en année sèche",
		soil: "S'adapte à de nombreux sols, préfère les sols profonds bien drainés",
		equipment: [
			"Sécateur ou scie d'élagage",
			"Gaule ou échelle pour la récolte en hauteur",
			"Pulvérisateur à moteur pour les grands vergers",
			"Caisses de récolte pour limiter les chocs",
		],
		fertilizer:
			"Fumier organique et NPK apportés après la récolte pour reconstituer les réserves et soutenir la floraison suivante.",
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
		image: "/images/crops/papaye.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Production toute l'année",
			sowing: "Plantation en début d'hivernage de préférence",
			harvest: "8 à 10 mois après plantation, puis en continu",
			note: "Croissance rapide, bon revenu de diversification.",
		},
		idealTemp: { min: 22, max: 32 },
		water: "Arrosage régulier, sensible à l'excès d'eau stagnante (pourriture du collet)",
		soil: "Sol léger, bien drainé, riche en matière organique, pH 6-6.5",
		equipment: [
			"Houe pour la préparation des billons",
			"Système d'irrigation ou arrosoir",
			"Gaule ou échelle pour la récolte",
		],
		fertilizer:
			"Fumier organique puis apports NPK équilibrés et réguliers, la croissance rapide de la papaye est exigeante en nutriments.",
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
		image: "/images/crops/pasteque.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Saison sèche ou début d'hivernage",
			sowing: "Février à Avril (irrigué) ou Juin (pluvial)",
			harvest: "3 mois après semis",
			note: "Forte demande en saison chaude, culture peu exigeante sur sol sableux.",
		},
		idealTemp: { min: 22, max: 32 },
		water: "Modéré mais régulier, réduire l'arrosage en fin de cycle pour améliorer le sucre",
		soil: "Sol sableux ou sablo-limoneux, bien drainé",
		equipment: [
			"Houe pour la préparation du sol",
			"Arrosoir ou système d'irrigation",
			"Paillage plastique ou végétal",
			"Brouette pour le transport (fruits lourds)",
		],
		fertilizer:
			"Fumier organique au semis, complété par de la potasse en fin de cycle pour améliorer la sucrosité des fruits.",
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
		image: "/images/crops/niebe.jpg",
		fallbackUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
		season: {
			label: "Hivernage",
			sowing: "Juin à Juillet",
			harvest: "Septembre à Octobre (2-3 mois)",
			note: "Légumineuse résistante à la sécheresse, améliore la fertilité du sol.",
		},
		idealTemp: { min: 20, max: 32 },
		water: "Faible besoin en eau, bonne résistance à la sécheresse",
		soil: "S'adapte aux sols pauvres et sableux, pH 5.5-7",
		equipment: [
			"Houe/daba ou semoir manuel",
			"Pulvérisateur à dos",
			"Faucille ou récolte manuelle des gousses",
		],
		fertilizer:
			"Besoin en azote limité (légumineuse fixatrice), un apport de phosphore favorise la formation des gousses.",
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

// Helper pour obtenir les étapes de croissance d'une culture avec fallback
export const getCropGrowthStages = (crop) => {
	if (crop && Array.isArray(crop.growthStages) && crop.growthStages.length > 0) {
		return crop.growthStages;
	}
	return defaultGrowthStages;
};

// Helper pour obtenir les détails illustrés des engins et matériel
export const getCropEquipmentDetails = (crop) => {
	if (crop && Array.isArray(crop.equipmentDetails) && crop.equipmentDetails.length > 0) {
		return crop.equipmentDetails;
	}
	if (!crop || !Array.isArray(crop.equipment)) return equipmentCatalog.slice(0, 4);

	const matched = [];
	const lowerEq = crop.equipment.map((e) => e.toLowerCase());

	equipmentCatalog.forEach((item) => {
		const isMatch = item.keywords.some((kw) =>
			lowerEq.some((eqStr) => eqStr.includes(kw))
		);
		if (isMatch) {
			matched.push(item);
		}
	});

	if (matched.length === 0) {
		return equipmentCatalog.slice(0, 4);
	}
	return matched;
};

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
