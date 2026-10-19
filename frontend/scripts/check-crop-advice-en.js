#!/usr/bin/env node
/**
 * Jour 57 (reporté du Jour 50) — vérifie que chaque texte français des fiches
 * de culture (src/data/cropAdviceData.js) a sa traduction dans
 * src/data/cropAdviceData.en.js, dictionnaire indexé par le texte exact.
 * Sans ce contrôle, modifier une phrase française la fait repasser en
 * français dans l'interface anglaise, sans aucune alerte.
 *
 * Parcourt les données exportées comme localizeCropData() les parcourt à
 * l'affichage (mêmes champs ignorés), et échoue (code 1) si un texte manque.
 * Les clés du dictionnaire devenues inutiles sont signalées sans bloquer.
 *
 * Usage : node scripts/check-crop-advice-en.js
 */
import {
	cropCategories,
	defaultGrowthStages,
	equipmentCatalog,
	cropAdviceData,
} from "../src/data/cropAdviceData.js";
import { cropAdviceEn } from "../src/data/cropAdviceData.en.js";

// Mêmes champs que UNTRANSLATED_KEYS dans cropAdviceData.js
const UNTRANSLATED_KEYS = new Set(["id", "image", "fallbackUrl", "value", "aliases", "keywords"]);
// Codes techniques (« vegetables », « soil-prep ») et valeurs sans lettre : rien à traduire
const isTechnical = (s) => /^[a-z0-9_-]+$/.test(s) || !/\p{L}/u.test(s);

const missing = new Map(); // texte -> premier chemin où il apparaît
const used = new Set();

const walk = (value, path, key = null) => {
	if (typeof value === "string") {
		if (UNTRANSLATED_KEYS.has(key) || isTechnical(value)) return;
		used.add(value);
		if (!(value in cropAdviceEn) && !missing.has(value)) missing.set(value, path);
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, i) => walk(item, `${path}[${i}]`, key));
	} else if (value && typeof value === "object") {
		Object.entries(value).forEach(([k, v]) => walk(v, `${path}.${k}`, k));
	}
};

walk(cropCategories, "cropCategories");
walk(defaultGrowthStages, "defaultGrowthStages");
walk(equipmentCatalog, "equipmentCatalog");
walk(cropAdviceData, "cropAdviceData");

const unused = Object.keys(cropAdviceEn).filter((k) => !used.has(k));
if (unused.length) {
	console.warn(`⚠️  ${unused.length} traduction(s) inutilisée(s) dans cropAdviceData.en.js (texte français modifié ou supprimé ?) :`);
	unused.slice(0, 20).forEach((k) => console.warn(`   - ${JSON.stringify(k).slice(0, 120)}`));
}

if (missing.size) {
	console.error(`❌ ${missing.size} texte(s) des fiches de culture sans traduction anglaise :`);
	for (const [text, path] of missing) {
		console.error(`   - ${path} : ${JSON.stringify(text).slice(0, 140)}`);
	}
	console.error("   → ajouter chaque texte (copié à l'identique) dans src/data/cropAdviceData.en.js");
	process.exit(1);
}

console.log(`✅ Fiches de culture : ${used.size} texte(s), tous traduits en anglais.`);
