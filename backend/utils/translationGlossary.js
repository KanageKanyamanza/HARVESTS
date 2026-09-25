const mongoose = require("mongoose");
const TranslationGlossary = require("../models/TranslationGlossary");
const fallbackGlossary = require("../data/translationGlossary.json");

// Jour 46 (bascule bilingue) - chargement du glossaire fr->en depuis la
// collection TranslationGlossary (éditable dans le back-office) avec cache
// mémoire. Le cache est invalidé à chaque écriture admin
// (invalidateGlossaryCache) ; le TTL couvre le cas de plusieurs instances du
// serveur, où l'invalidation ne touche que l'instance qui a reçu l'écriture.
//
// Repli sur backend/data/translationGlossary.json uniquement si la base
// n'est pas joignable (script lancé sans connexion, DB tombée) : une
// collection vide est une situation légitime (tout supprimé par l'admin) et
// ne doit pas faire ressurgir les anciennes entrées du fichier.
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheLoadedAt = 0;
let pendingLoad = null;
let generation = 0;

function compileReplacement(rule) {
	try {
		return { regex: new RegExp(rule.match, rule.flags || "gi"), replace: rule.replace };
	} catch (error) {
		console.warn(`Glossaire : motif ignoré (${rule.match}) : ${error.message}`);
		return null;
	}
}

function buildGlossary(exactEntries, replacementRules) {
	const exactTerms = new Map();
	for (const { source, target } of exactEntries) {
		exactTerms.set(source.trim().toLowerCase(), target);
	}
	return {
		exactTerms,
		replacements: replacementRules.map(compileReplacement).filter(Boolean),
	};
}

function buildFromJson() {
	return buildGlossary(
		Object.entries(fallbackGlossary.exactTerms || {}).map(([source, target]) => ({ source, target })),
		fallbackGlossary.wordReplacements || [],
	);
}

async function buildFromDatabase() {
	const entries = await TranslationGlossary.find().sort({ createdAt: 1 }).lean();
	return buildGlossary(
		entries.filter((e) => e.type === "exact"),
		entries
			.filter((e) => e.type === "replacement")
			.map((e) => ({ match: e.source, replace: e.target, flags: e.flags })),
	);
}

async function loadGlossary() {
	if (cache && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return cache;
	if (pendingLoad) return pendingLoad;

	const loadGeneration = generation;
	const load = (async () => {
		if (mongoose.connection.readyState !== 1) {
			// Pas mis en cache : la DB peut revenir entre deux traductions
			return buildFromJson();
		}
		try {
			const fresh = await buildFromDatabase();
			// Une écriture admin pendant la lecture rend ce résultat périmé
			if (loadGeneration === generation) {
				cache = fresh;
				cacheLoadedAt = Date.now();
			}
			return fresh;
		} catch (error) {
			console.warn("Glossaire : lecture DB impossible, repli sur le fichier JSON :", error.message);
			return cache || buildFromJson();
		}
	})();
	pendingLoad = load;

	try {
		return await load;
	} finally {
		if (pendingLoad === load) pendingLoad = null;
	}
}

function invalidateGlossaryCache() {
	generation += 1;
	cache = null;
	cacheLoadedAt = 0;
	pendingLoad = null;
}

module.exports = { loadGlossary, invalidateGlossaryCache };
