/**
 * Seed des produits de démonstration des comptes de test.
 *
 * Ces produits ne sont visibles que par les comptes de test (sandbox des
 * démos) : voir utils/testAccounts.js et les filtres de visibilité publique.
 *
 * Usage :
 *   node scripts/seed-demo-test-products.js            # dry-run (aucune écriture)
 *   node scripts/seed-demo-test-products.js --execute  # crée / met à jour en base
 *
 * Le script est idempotent : un produit existant du même vendeur portant le
 * même nom est mis à jour au lieu d'être dupliqué.
 *
 * Photos : Wikimedia Commons (licences libres), ré-uploadées sur le Cloudinary
 * du projet pour la démo :
 *  - Tomates : "Bright red tomato and cross section02.jpg"
 *  - Mangues : "Mangos - single and halved.jpg"
 *  - Oignons : "Bulk red onions vegetables, April 2023.jpg"
 *  - Niébé : "Black-eyed-pea.jpg"
 *  - Arachides : "Peanuts (Arachis hypogaea) - in shell, shell cracked open, shelled, peeled.jpg"
 *  - Mil : "Millet grains sold at Kargil Bazaar.jpg"
 *  - Jus de mangue : "Glass of Mango Juice.jpg"
 *  - Farine de mil : "Calabash bowls - 6 hand processing millet flour..."
 *  - Huile d'arachide : "Groundnut oil.jpg"
 *  - Concentré de tomate : "Tomato paste on spoon.jpg"
 *  - Couscous de mil : "Couscous (74111).jpg"
 *  - Thiéboudienne : "Ceebu Jen, Senegalese dish.jpg"
 *  - Mafé : "Mafe SN.JPG"
 *  - Yassa : "Poulet yassa 01.jpg"
 *  - Salade de mangue : "Mango fruit salad (2025).jpg"
 *  - Bissap : "A glass of hibiscus tea 01.jpg"
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Product = require("../models/Product");
const User = require("../models/User");

const EXECUTE = process.argv.includes("--execute");

const IMAGES = {
	tomates:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499846/harvests/products/demo-test-tomates.jpg",
	mangues:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499847/harvests/products/demo-test-mangues.jpg",
	oignons:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499848/harvests/products/demo-test-oignons.jpg",
	niebe:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499848/harvests/products/demo-test-niebe.jpg",
	arachides:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499849/harvests/products/demo-test-arachides.jpg",
	mil: "https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499850/harvests/products/demo-test-mil.jpg",
	jus_mangue:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499851/harvests/products/demo-test-jus_mangue.jpg",
	farine_mil:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499852/harvests/products/demo-test-farine_mil.jpg",
	huile_arachide:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499852/harvests/products/demo-test-huile_arachide.jpg",
	concentre_tomate:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499853/harvests/products/demo-test-concentre_tomate.jpg",
	couscous_mil:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499854/harvests/products/demo-test-couscous_mil.jpg",
	thieboudienne:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499854/harvests/products/demo-test-thieboudienne.jpg",
	mafe: "https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499855/harvests/products/demo-test-mafe.jpg",
	yassa:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499856/harvests/products/demo-test-yassa.jpg",
	salade_mangue:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499857/harvests/products/demo-test-salade_mangue.jpg",
	bissap:
		"https://res.cloudinary.com/dlbwu1dld/image/upload/v1792499857/harvests/products/demo-test-bissap.jpg",
};

const ACCOUNTS = {
	producer: "producteur.test@harvests.dev",
	transformer: "transformateur.test@harvests.dev",
	restaurateur: "restaurateur.test@harvests.dev",
};

/**
 * Catalogue de démonstration. `vendor` correspond à l'e-mail du compte test et
 * au champ vendeur du produit (producer / transformer / restaurateur).
 */
const PRODUCTS = [
	// ---------------------------------------------------------------- producteur
	{
		vendor: "producer",
		name: { fr: "Tomates", en: "Tomatoes" },
		description: {
			fr: "Tomates fraîches, mûres à point, cultivées à la Ferme Test Harvests.",
			en: "Fresh, ripe tomatoes grown at Ferme Test Harvests.",
		},
		shortDescription: {
			fr: "Tomates fraîches du jour, idéales pour salades et sauces.",
			en: "Fresh daily tomatoes, perfect for salads and sauces.",
		},
		category: "vegetables",
		subcategory: "vegetables",
		price: 500,
		unit: "kg",
		stock: 200,
		image: IMAGES.tomates,
		tags: ["tomates", "legumes", "senegal"],
	},
	{
		vendor: "producer",
		name: { fr: "Mangues Kent", en: "Kent Mangoes" },
		description: {
			fr: "Mangues Kent juteuses et sucrées, récoltées à maturité au Sénégal.",
			en: "Juicy, sweet Kent mangoes harvested at maturity in Senegal.",
		},
		shortDescription: {
			fr: "Mangues Kent sucrées et parfumées, idéales pour le dessert.",
			en: "Sweet, fragrant Kent mangoes, perfect for dessert.",
		},
		category: "fruits",
		subcategory: "fruits",
		price: 1500,
		compareAtPrice: 1800,
		unit: "kg",
		stock: 150,
		image: IMAGES.mangues,
		featured: true,
		tags: ["mangues", "kent", "fruits", "senegal"],
	},
	{
		vendor: "producer",
		name: { fr: "Oignons violets", en: "Red Onions" },
		description: {
			fr: "Oignons violets de qualité, parfaits pour vos plats et vos sauces.",
			en: "Quality red onions, perfect for your dishes and sauces.",
		},
		shortDescription: {
			fr: "Oignons violets frais, sélectionnés à la main.",
			en: "Fresh red onions, hand-selected.",
		},
		category: "vegetables",
		subcategory: "vegetables",
		price: 800,
		unit: "kg",
		stock: 300,
		image: IMAGES.oignons,
		tags: ["oignons", "legumes", "senegal"],
	},
	{
		vendor: "producer",
		name: { fr: "Niébé", en: "Cowpeas" },
		description: {
			fr: "Niébé trié et nettoyé, prêt à cuisiner.",
			en: "Sorted and cleaned cowpeas, ready to cook.",
		},
		shortDescription: {
			fr: "Niébé de qualité, idéal pour les plats traditionnels.",
			en: "Quality cowpeas, ideal for traditional dishes.",
		},
		category: "legumes",
		subcategory: "legumes",
		price: 1200,
		unit: "kg",
		stock: 100,
		image: IMAGES.niebe,
		tags: ["niebe", "legumineuses", "senegal"],
	},
	{
		vendor: "producer",
		name: { fr: "Arachides décortiquées", en: "Shelled Peanuts" },
		description: {
			fr: "Arachides décortiquées, idéales pour les sauces et les snacks.",
			en: "Shelled peanuts, ideal for sauces and snacks.",
		},
		shortDescription: {
			fr: "Arachides fraîches décortiquées, prêtes à utiliser.",
			en: "Fresh shelled peanuts, ready to use.",
		},
		category: "nuts",
		subcategory: "nuts",
		price: 1000,
		unit: "kg",
		stock: 120,
		image: IMAGES.arachides,
		tags: ["arachides", "cacahuetes", "senegal"],
	},
	{
		vendor: "producer",
		name: { fr: "Mil local", en: "Local Millet" },
		description: {
			fr: "Mil local cultivé au Sénégal, idéal pour le couscous et les bouillies.",
			en: "Local millet grown in Senegal, ideal for couscous and porridge.",
		},
		shortDescription: {
			fr: "Mil local de qualité, cultivé par la Ferme Test Harvests.",
			en: "Quality local millet, grown by Ferme Test Harvests.",
		},
		category: "cereals",
		subcategory: "cereals",
		price: 700,
		unit: "kg",
		stock: 200,
		image: IMAGES.mil,
		tags: ["mil", "cereales", "senegal"],
	},

	// ------------------------------------------------------------- transformateur
	{
		vendor: "transformer",
		name: { fr: "Jus de mangue naturel", en: "Natural Mango Juice" },
		description: {
			fr: "Jus de mangue 100 % naturel, sans conservateur, préparé à Dakar.",
			en: "100% natural mango juice, preservative-free, made in Dakar.",
		},
		shortDescription: {
			fr: "Jus de mangue frais, sans sucre ajouté.",
			en: "Fresh mango juice, no added sugar.",
		},
		category: "beverages",
		subcategory: "beverages",
		price: 2500,
		compareAtPrice: 3000,
		unit: "L",
		stock: 80,
		image: IMAGES.jus_mangue,
		featured: true,
		tags: ["jus", "mangue", "boisson", "senegal"],
	},
	{
		vendor: "transformer",
		name: { fr: "Farine de mil", en: "Millet Flour" },
		description: {
			fr: "Farine de mil finement moulue, idéale pour les bouillies et le couscous.",
			en: "Finely milled millet flour, ideal for porridge and couscous.",
		},
		shortDescription: {
			fr: "Farine de mil locale, moulue artisanalement.",
			en: "Local millet flour, artisanally milled.",
		},
		category: "processed-foods",
		subcategory: "processed-foods",
		price: 1800,
		unit: "kg",
		stock: 100,
		image: IMAGES.farine_mil,
		tags: ["farine", "mil", "transformation", "senegal"],
	},
	{
		vendor: "transformer",
		name: { fr: "Huile d'arachide artisanale", en: "Artisanal Peanut Oil" },
		description: {
			fr: "Huile d'arachide pressée artisanalement, 100 % naturelle.",
			en: "Artisanally pressed peanut oil, 100% natural.",
		},
		shortDescription: {
			fr: "Huile d'arachide pure, pressée à froid.",
			en: "Pure cold-pressed peanut oil.",
		},
		category: "processed-foods",
		subcategory: "processed-foods",
		price: 3000,
		compareAtPrice: 3500,
		unit: "L",
		stock: 60,
		image: IMAGES.huile_arachide,
		tags: ["huile", "arachide", "artisanal", "senegal"],
	},
	{
		vendor: "transformer",
		name: { fr: "Concentré de tomate", en: "Tomato Paste" },
		description: {
			fr: "Concentré de tomate préparé à partir de tomates fraîches.",
			en: "Tomato paste made from fresh tomatoes.",
		},
		shortDescription: {
			fr: "Concentré de tomate intense, sans colorant.",
			en: "Intense tomato paste, no artificial colouring.",
		},
		category: "processed-foods",
		subcategory: "processed-foods",
		price: 1500,
		unit: "pot",
		stock: 90,
		image: IMAGES.concentre_tomate,
		tags: ["tomate", "concentre", "transformation", "senegal"],
	},
	{
		vendor: "transformer",
		name: { fr: "Couscous de mil", en: "Millet Couscous" },
		description: {
			fr: "Couscous de mil traditionnel, prêt à cuire.",
			en: "Traditional millet couscous, ready to cook.",
		},
		shortDescription: {
			fr: "Couscous de mil artisanal, grain régulier.",
			en: "Artisanal millet couscous, even grain.",
		},
		category: "processed-foods",
		subcategory: "processed-foods",
		price: 2000,
		unit: "kg",
		stock: 70,
		image: IMAGES.couscous_mil,
		tags: ["couscous", "mil", "transformation", "senegal"],
	},

	// ---------------------------------------------------------------- restaurateur
	{
		vendor: "restaurateur",
		originType: "dish",
		name: { fr: "Thiéboudienne", en: "Thieboudienne" },
		description: {
			fr: "Riz au poisson à la sénégalaise, sauce tomate et légumes.",
			en: "Senegalese fish and rice with tomato sauce and vegetables.",
		},
		shortDescription: {
			fr: "Le grand classique sénégalais, préparé maison.",
			en: "The great Senegalese classic, homemade.",
		},
		category: "processed-foods",
		subcategory: "dish-plat",
		dishCategory: "plat",
		preparationTime: 45,
		allergens: ["poisson"],
		price: 3500,
		compareAtPrice: 4000,
		unit: "portion",
		stock: 30,
		image: IMAGES.thieboudienne,
		featured: true,
		tags: ["thieboudienne", "poisson", "riz", "senegal"],
	},
	{
		vendor: "restaurateur",
		originType: "dish",
		name: { fr: "Mafé de bœuf", en: "Beef Mafé" },
		description: {
			fr: "Bœuf mijoté dans une sauce arachide onctueuse, servi avec du riz.",
			en: "Beef simmered in a smooth peanut sauce, served with rice.",
		},
		shortDescription: {
			fr: "Mafé généreux à la sauce arachide.",
			en: "Generous mafé in peanut sauce.",
		},
		category: "processed-foods",
		subcategory: "dish-plat",
		dishCategory: "plat",
		preparationTime: 40,
		allergens: ["arachide"],
		price: 3000,
		unit: "portion",
		stock: 25,
		image: IMAGES.mafe,
		tags: ["mafe", "boeuf", "arachide", "senegal"],
	},
	{
		vendor: "restaurateur",
		originType: "dish",
		name: { fr: "Yassa poulet", en: "Chicken Yassa" },
		description: {
			fr: "Poulet mariné au citron et aux oignons, servi avec du riz.",
			en: "Chicken marinated in lemon and onions, served with rice.",
		},
		shortDescription: {
			fr: "Yassa poulet acidulé et parfumé.",
			en: "Tangy, fragrant chicken yassa.",
		},
		category: "processed-foods",
		subcategory: "dish-plat",
		dishCategory: "plat",
		preparationTime: 35,
		allergens: [],
		price: 3200,
		unit: "portion",
		stock: 25,
		image: IMAGES.yassa,
		tags: ["yassa", "poulet", "riz", "senegal"],
	},
	{
		vendor: "restaurateur",
		originType: "dish",
		name: { fr: "Salade de mangue", en: "Mango Salad" },
		description: {
			fr: "Salade fraîche de mangue, citron vert et menthe.",
			en: "Fresh mango salad with lime and mint.",
		},
		shortDescription: {
			fr: "Salade de mangue fraîche et acidulée.",
			en: "Fresh, tangy mango salad.",
		},
		category: "processed-foods",
		subcategory: "dish-entree",
		dishCategory: "entrée",
		preparationTime: 15,
		allergens: [],
		price: 1500,
		unit: "portion",
		stock: 20,
		image: IMAGES.salade_mangue,
		tags: ["salade", "mangue", "entree", "senegal"],
	},
	{
		vendor: "restaurateur",
		originType: "dish",
		name: { fr: "Bissap", en: "Bissap" },
		description: {
			fr: "Boisson rafraîchissante à l'hibiscus, servie fraîche.",
			en: "Refreshing hibiscus drink, served chilled.",
		},
		shortDescription: {
			fr: "Bissap maison, légèrement sucré.",
			en: "Homemade bissap, lightly sweetened.",
		},
		category: "beverages",
		subcategory: "dish-boisson",
		dishCategory: "boisson",
		preparationTime: 5,
		allergens: [],
		price: 1000,
		unit: "verre",
		stock: 50,
		image: IMAGES.bissap,
		tags: ["bissap", "hibiscus", "boisson", "senegal"],
	},
];

function buildProductData(spec, vendor) {
	const data = {
		name: spec.name,
		description: spec.description,
		shortDescription: spec.shortDescription,
		userType: spec.vendor,
		originType: spec.originType || "catalog",
		category: spec.category,
		subcategory: spec.subcategory,
		tags: ["demo-test", ...(spec.tags || [])],
		unit: spec.unit,
		hasVariants: false,
		price: spec.price,
		currency: "XOF",
		images: [
			{
				url: spec.image,
				alt: spec.name.fr,
				isPrimary: true,
				order: 0,
			},
		],
		inventory: {
			quantity: spec.stock,
			lowStockThreshold: Math.max(5, Math.round(spec.stock * 0.1)),
			trackQuantity: true,
			allowBackorder: false,
			reservedQuantity: 0,
		},
		minimumOrderQuantity: 1,
		status: "approved",
		isActive: true,
		isPublic: true,
		isFeatured: Boolean(spec.featured),
		publishedAt: new Date(),
		stats: { views: 0, sales: 0, favorites: 0 },
	};

	if (spec.compareAtPrice) data.compareAtPrice = spec.compareAtPrice;

	if (data.originType === "dish") {
		data.dishInfo = {
			category: spec.dishCategory || "plat",
			preparationTime: spec.preparationTime || 30,
			allergens: spec.allergens || [],
		};
	}

	data[spec.vendor] = vendor._id;
	return data;
}

async function main() {
	await mongoose.connect(
		process.env.DATABASE_URL || process.env.DATABASE_PROD,
		{ serverSelectionTimeoutMS: 10000, family: 4 },
	);

	const vendors = {};
	for (const [type, email] of Object.entries(ACCOUNTS)) {
		const user = await User.findOne({ email })
			.setOptions({ includeTestAccounts: true })
			.select("_id email userType isTestAccount");
		if (!user) {
			throw new Error(`Compte de test introuvable : ${email}`);
		}
		if (!user.isTestAccount) {
			throw new Error(`Le compte ${email} n'est pas marqué comme compte de test`);
		}
		vendors[type] = user;
	}

	console.log(EXECUTE ? "🚀 Mode EXECUTE (écriture en base)" : "🧪 Mode DRY-RUN (aucune écriture)");
	console.log(`Comptes : ${Object.values(vendors).map((u) => `${u.userType}:${u.email}`).join(", ")}\n`);

	let created = 0;
	let updated = 0;

	for (const spec of PRODUCTS) {
		const vendor = vendors[spec.vendor];
		const data = buildProductData(spec, vendor);

		const existing = await Product.findOne({
			[spec.vendor]: vendor._id,
			"name.fr": spec.name.fr,
		});

		if (existing) {
			if (EXECUTE) {
				existing.set(data);
				await existing.save();
			}
			updated++;
			console.log(`♻️  ${spec.vendor.padEnd(12)} ${spec.name.fr} — mis à jour`);
		} else {
			if (EXECUTE) {
				await Product.create(data);
			}
			created++;
			console.log(`➕ ${spec.vendor.padEnd(12)} ${spec.name.fr} — créé`);
		}
	}

	console.log(
		`\n${EXECUTE ? "Terminé" : "Dry-run terminé"} : ${created} création(s), ${updated} mise(s) à jour.`,
	);
	if (!EXECUTE) {
		console.log("Relance avec --execute pour écrire en base.");
	}

	await mongoose.disconnect();
}

main().catch(async (error) => {
	console.error("Erreur :", error);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
