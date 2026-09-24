const axios = require("axios");
const glossary = require("../data/translationGlossary.json");

// Jour 45 (bascule bilingue) - glossaire fr->en pour corriger le vocabulaire
// agricole/culinaire local que MyMemory/LibreTranslate traduisent mal ou pas
// du tout (ex. "Corète Potagère" -> "Corchorus olitorius"/"corte", "tô" ->
// "toe"). Deux passes : correspondance exacte (court-circuite l'appel MT pour
// les termes courts comme les noms de produits) et remplacements de mots
// appliqués sur le résultat de la MT (pour les fragments dans un texte plus
// long, ex. une description). Voir backend/data/translationGlossary.json.
const compiledReplacements = (glossary.wordReplacements || []).map((rule) => ({
	regex: new RegExp(rule.match, rule.flags || "gi"),
	replace: rule.replace,
}));

function lookupExactTerm(text) {
	const normalized = text.trim().toLowerCase();
	const entry = glossary.exactTerms?.[normalized];
	return entry || null;
}

function applyWordReplacements(text) {
	let result = text;
	for (const { regex, replace } of compiledReplacements) {
		result = result.replace(regex, replace);
	}
	return result;
}

const MYMEMORY_MAX_LEN = 500;

// Découpe un texte long en morceaux <= maxLen en respectant les fins de
// phrase (. ! ? ou saut de ligne) quand c'est possible, pour ne pas couper
// au milieu d'un mot lors de la traduction par chunks (MyMemory refuse tout
// texte > 500 caractères par appel).
function chunkText(text, maxLen = MYMEMORY_MAX_LEN) {
	if (text.length <= maxLen) return [text];

	const sentences = text.split(/(?<=[.!?\n])\s+/);
	const chunks = [];
	let current = "";

	for (const sentence of sentences) {
		if (sentence.length > maxLen) {
			// Phrase elle-même trop longue : découpage brut en dernier recours
			if (current) {
				chunks.push(current.trim());
				current = "";
			}
			for (let i = 0; i < sentence.length; i += maxLen) {
				chunks.push(sentence.slice(i, i + maxLen));
			}
			continue;
		}
		if ((current + " " + sentence).trim().length > maxLen) {
			chunks.push(current.trim());
			current = sentence;
		} else {
			current = (current + " " + sentence).trim();
		}
	}
	if (current) chunks.push(current.trim());

	return chunks;
}

async function translateChunkViaMyMemory(chunk, fromLang, toLang) {
	// MyMemory répond parfois en 4-5s sous charge (constaté le 24/09 après une
	// migration en masse) — 5s était trop court et faisait échouer des chunks
	// pourtant valides.
	const response = await axios.get("https://api.mymemory.translated.net/get", {
		params: { q: chunk, langpair: `${fromLang}|${toLang}` },
		timeout: 15000,
	});

	const status = String(response.data?.responseStatus ?? "200");
	const translated = response.data?.responseData?.translatedText;
	if (status === "200" && translated) {
		return translated;
	}
	return null;
}

// LibreTranslate (repli historique) exige désormais une clé API payante côté
// de.libretranslate.com — l'ancien accès anonyme via libretranslate.de a
// fermé (24/09, constaté lors de la migration du catalogue). On ne tente
// l'appel que si une clé est configurée, pour ne pas perdre 5s en timeout à
// chaque traduction pour rien.
async function translateViaLibreTranslate(text, fromLang, toLang) {
	const apiKey = process.env.LIBRETRANSLATE_API_KEY;
	if (!apiKey) return null;

	const response = await axios.post(
		"https://de.libretranslate.com/translate",
		{ q: text, source: fromLang, target: toLang, format: "text", api_key: apiKey },
		{ headers: { "Content-Type": "application/json" }, timeout: 8000 },
	);

	return response.data?.translatedText || null;
}

/**
 * Traduction automatique via MyMemory (avec découpage en chunks <=500
 * caractères pour les textes longs), repli sur LibreTranslate si une clé API
 * est configurée, et passage par le glossaire métier (voir plus haut)
 * avant/après. Extrait de blogAdminController.translateText (Jour 45 -
 * bascule bilingue du contenu produit) pour être réutilisable par le
 * middleware Product et les contrôleurs de plats du restaurateur.
 *
 * Best-effort : ne lance jamais d'exception. En cas d'échec, retourne le
 * texte source (l'appelant décide quoi en faire).
 */
async function translateText(text, fromLang = "fr", toLang = "en") {
	if (!text || typeof text !== "string" || !text.trim()) {
		return { translatedText: text || "", ok: false };
	}

	if (fromLang === toLang) {
		return { translatedText: text, ok: true };
	}

	if (fromLang === "fr" && toLang === "en") {
		const exact = lookupExactTerm(text);
		if (exact) {
			return { translatedText: exact, ok: true, provider: "glossary" };
		}
	}

	try {
		const chunks = chunkText(text);
		const translatedChunks = [];
		for (const chunk of chunks) {
			const translated = await translateChunkViaMyMemory(chunk, fromLang, toLang);
			if (!translated) throw new Error("chunk translation failed");
			translatedChunks.push(translated);
		}
		return {
			translatedText: applyWordReplacements(translatedChunks.join(" ")),
			ok: true,
			provider: chunks.length > 1 ? "mymemory-chunked" : "mymemory",
		};
	} catch (mymemoryError) {
		// on tente LibreTranslate ci-dessous (si une clé API est configurée)
	}

	try {
		const translated = await translateViaLibreTranslate(text, fromLang, toLang);
		if (translated) {
			return {
				translatedText: applyWordReplacements(translated),
				ok: true,
				provider: "libretranslate",
			};
		}
	} catch (libreError) {
		// les deux services ont échoué
	}

	return { translatedText: text, ok: false };
}

module.exports = { translateText };
