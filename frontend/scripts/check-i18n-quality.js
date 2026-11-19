#!/usr/bin/env node
/**
 * Jour 71 (relecture anglaise) — garde-fou qualité des traductions anglaises.
 *
 * Trois contrôles que les garde-fous existants ne font pas :
 *  1. parité des variables d'interpolation (`{{count}}` présent en fr mais pas
 *     en en → texte tronqué à l'affichage, invisible en revue de code) ;
 *  2. restes de français dans les valeurs anglaises (mots-outils, accents) ;
 *  3. cohérence orthographique : l'anglais du site est britannique (en-GB),
 *     cf. décision J71-1 — pas de mélange favor/favour, optimize/optimise…
 *
 * Périmètre : `src/locales/en/*.json` + `data/cropAdviceData.en.js` et, s'il
 * existe, `../backend/locales/en.json` (comparé à son fr.json).
 *
 * Usage : node scripts/check-i18n-quality.js
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const LOCALES_DIR = join(PROJECT_ROOT, "src", "locales");
const CROP_ADVICE_EN = join(PROJECT_ROOT, "src", "data", "cropAdviceData.en.js");
const BACKEND_EN = join(PROJECT_ROOT, "..", "backend", "locales", "en.json");
const BACKEND_FR = join(PROJECT_ROOT, "..", "backend", "locales", "fr.json");

// --- Contrôle 1 : variables d'interpolation --------------------------------

function placeholders(text) {
	const found = new Set();
	for (const match of text.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)) found.add(`{{${match[1]}}}`);
	for (const match of text.matchAll(/(^|[^{])\{\s*([\w.]+)\s*\}/g)) found.add(`{${match[2]}}`);
	return found;
}

// --- Contrôle 2 : restes de français ---------------------------------------

// Mots-outils et vocabulaire qui n'apparaissent pas dans un texte anglais.
const FRENCH_MARKERS = [
	"votre", "vos", "notre", "nos", "avec", "pour", "dans", "chez", "vous", "nous",
	"livraison", "commande", "produits", "gratuit", "gratuite", "aucun", "aucune",
	"tous", "toutes", "être", "faire", "moins", "même", "aussi", "mais", "donc",
	"alors", "ainsi", "selon", "entre", "vers", "sans", "sous", "par", "sont",
	"été", "avoir", "déjà", "encore", "jamais", "toujours", "nouveau", "nouvelle",
	"prochain", "dernier", "dernière", "récolte", "culture", "producteur",
];

// Noms propres, marques et emprunts dont l'accent est légitime en anglais.
const ACCENT_ALLOWLIST = [
	"Sénégal", "Sénégalais", "Sénégalaise", "Bénin", "Béninois", "Côte d'Ivoire",
	"Côte d’Ivoire", "République", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor",
	"Tambacounda", "Kolda", "Diourbel", "Louga", "Fatick", "Kaffrine", "Mbour",
	"Touba", "Médina", "Dakar", "Saly", "Société Générale", "café", "Café", "tô",
	"Tô", "corète", "Corète", "niébé", "Niébé", "soumbala", "bissap", "daba",
];

const ACCENT_RE = /[àâäéèêëîïôöùûüçœÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ]/;
const WORD_RE = /\b[\p{L}'-]+\b/gu;

function frenchLeftovers(text) {
	const issues = [];
	const lower = text.toLowerCase();
	for (const marker of FRENCH_MARKERS) {
		// « plus » et « sur » sont aussi des mots anglais : on les écarte.
		if (new RegExp(`\\b${marker}\\b`, "i").test(lower)) issues.push(`mot français « ${marker} »`);
	}

	let masked = text;
	for (const word of ACCENT_ALLOWLIST) masked = masked.split(word).join(" ");
	if (ACCENT_RE.test(masked)) {
		const accented = [...new Set((masked.match(WORD_RE) || []).filter((w) => ACCENT_RE.test(w)))];
		if (accented.length) issues.push(`accent(s) : ${accented.join(", ")}`);
	}
	return issues;
}

// --- Contrôle 3 : orthographe britannique ---------------------------------

// Variante américaine -> variante britannique retenue (décision J71-1).
const AMERICAN_SPELLINGS = [
	[/\bfavor/g, "favour"],
	[/\bFavor/g, "Favour"],
	[/\bcolor/g, "colour"],
	[/\bColor/g, "Colour"],
	[/\bcenter\b/g, "centre"],
	[/\bliter(?=s?\b)/g, "litre"],
	[/\bLiter(?=s?\b)/g, "Litre"],
	[/\bfertilizer/g, "fertiliser"],
	[/\bFertilizer/g, "Fertiliser"],
	[/\brecogniz/g, "recognis"],
	[/\bRecogniz/g, "Recognis"],
	[/\boptimiz/g, "optimis"],
	[/\bOptimiz/g, "Optimis"],
	[/\bcustomiz/g, "customis"],
	[/\bCustomiz/g, "Customis"],
	[/\banalyz/g, "analys"],
	[/\bAnalyz/g, "Analys"],
	[/\blicens/g, "licenc"],
	[/\bLicens/g, "Licenc"],
	[/\bneighbor/g, "neighbour"],
	[/\bbehavior/g, "behaviour"],
	[/\blabor\b/g, "labour"],
	[/\bgray\b/g, "grey"],
	[/\bprograms\b/g, "programmes"],
	[/\bPrograms\b/g, "Programmes"],
	[/\bprogram\b/g, "programme"],
	[/\bProgram\b/g, "Programme"],
];

// « Licence » reste correct en anglais britannique pour le nom ; le verbe
// « to license » est épargné par la liste ci-dessus (forme -s- en finale).
const SPELLING_EXCEPTIONS = [/licens(e|ed|ing)\b/i];

// Suffixe -ize/-ization : traité globalement plutôt que mot par mot, sinon la
// liste s'allonge à chaque nouvelle traduction (« unauthorized » et
// « unauthorised » ont coexisté). Mots en « ize » qui ne sont pas des verbes.
const IZE_RE = /\b[a-zA-Z]+iz(?:e|es|ed|ing|ation|ations)\b/g;
const IZE_EXCEPTIONS = new Set([
	"size", "sizes", "sized", "sizing",
	"oversize", "oversized", "oversizes",
	"maize", "prize", "prizes", "prized",
	"seize", "seizes", "seized", "seizing",
	"capsize", "capsized", "capsizes",
]);

function americanSpellings(text) {
	const issues = [];

	for (const match of text.matchAll(IZE_RE)) {
		const word = match[0];
		if (IZE_EXCEPTIONS.has(word.toLowerCase())) continue;
		issues.push(`« ${word} » → « ${word.replace(/iz/, "is")} » (suffixe -ise)`);
	}

	for (const [pattern, replacement] of AMERICAN_SPELLINGS) {
		const re = new RegExp(pattern.source, pattern.flags);
		let match;
		while ((match = re.exec(text)) !== null) {
			const context = text.slice(Math.max(0, match.index - 12), match.index + 18);
			if (SPELLING_EXCEPTIONS.some((exception) => exception.test(context))) continue;
			issues.push(`« ${match[0]} » → « ${replacement} »`);
			break; // une seule occurrence par valeur suffit au rapport
		}
	}
	return issues;
}

// --- Contrôle 4 : typographie et codes devise -----------------------------

// Convention Jour 70 : les montants s'affichent en FCFA. « XAF » est en plus
// le franc CFA d'Afrique centrale (mauvaise zone pour le Sénégal).
function typographyIssues(text) {
	const issues = [];
	if (/\bXAF\b/.test(text)) issues.push("« XAF » → « FCFA » (et non le franc CFA d'Afrique centrale)");
	if (/\bXOF\b/.test(text)) issues.push("« XOF » → « FCFA » (code technique, pas un libellé)");
	if (/\.\.\./.test(text)) issues.push("« ... » → « … » (points de suspension typographiques)");
	if (/[A-Za-z0-9)\]]\s+:/.test(text)) issues.push("espace avant « : » (typographie française)");
	return issues;
}

// --- Parcours -------------------------------------------------------------

const problems = [];
const report = (file, key, kind, detail) => problems.push({ file, key, kind, detail });

function flatten(node, prefix = "", out = []) {
	if (typeof node === "string") {
		out.push([prefix, node]);
		return out;
	}
	if (Array.isArray(node)) {
		node.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
		return out;
	}
	if (node && typeof node === "object") {
		for (const [k, v] of Object.entries(node)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
	}
	return out;
}

function checkPair(file, frPath, enPath, { withPlaceholders }) {
	if (!existsSync(enPath) || !existsSync(frPath)) return;
	const fr = new Map(flatten(JSON.parse(readFileSync(frPath, "utf8"))));
	const en = JSON.parse(readFileSync(enPath, "utf8"));

	for (const [key, value] of flatten(en)) {
		if (withPlaceholders) {
			const frValue = fr.get(key);
			if (frValue !== undefined) {
				const expected = placeholders(frValue);
				const actual = placeholders(value);
				const missing = [...expected].filter((v) => !actual.has(v));
				const extra = [...actual].filter((v) => !expected.has(v));
				if (missing.length) {
					report(file, key, "interpolation", `variable(s) absente(s) : ${missing.join(", ")}`);
				}
				if (extra.length) {
					report(file, key, "interpolation", `variable(s) en trop : ${extra.join(", ")}`);
				}
			}
		}

		for (const issue of frenchLeftovers(value)) report(file, key, "français", issue);
		for (const issue of americanSpellings(value)) report(file, key, "orthographe", issue);
		for (const issue of typographyIssues(value)) report(file, key, "typographie", issue);
	}
}

for (const file of readdirSync(join(LOCALES_DIR, "en")).filter((f) => f.endsWith(".json"))) {
	checkPair(
		`en/${file}`,
		join(LOCALES_DIR, "fr", file),
		join(LOCALES_DIR, "en", file),
		{ withPlaceholders: true },
	);
}

checkPair("backend/en.json", BACKEND_FR, BACKEND_EN, { withPlaceholders: true });

// Contenu agricole : les clés sont les textes français d'origine, seules les
// valeurs sont en anglais et donc à contrôler.
if (existsSync(CROP_ADVICE_EN)) {
	const source = readFileSync(CROP_ADVICE_EN, "utf8");
	const module = await import(`file://${CROP_ADVICE_EN.replace(/\\/g, "/")}`);
	for (const [frenchKey, englishValue] of Object.entries(module.cropAdviceEn || {})) {
		const key = `${frenchKey.slice(0, 48)}${frenchKey.length > 48 ? "…" : ""}`;
		const expected = placeholders(frenchKey);
		const actual = placeholders(englishValue);
		for (const missing of expected) {
			if (!actual.has(missing)) report("cropAdviceData.en.js", key, "interpolation", `variable absente : ${missing}`);
		}
		for (const issue of frenchLeftovers(englishValue)) report("cropAdviceData.en.js", key, "français", issue);
		for (const issue of americanSpellings(englishValue)) report("cropAdviceData.en.js", key, "orthographe", issue);
		for (const issue of typographyIssues(englishValue)) report("cropAdviceData.en.js", key, "typographie", issue);
	}
	void source;
}

// --- Rapport --------------------------------------------------------------

if (problems.length === 0) {
	console.log("✅ Qualité des traductions anglaises OK (interpolation, restes de français, orthographe en-GB).");
	process.exit(0);
}

const grouped = problems.reduce((acc, p) => {
	acc[p.kind] = acc[p.kind] || [];
	acc[p.kind].push(p);
	return acc;
}, {});

console.error(`❌ ${problems.length} problème(s) dans les traductions anglaises :`);
for (const [kind, list] of Object.entries(grouped)) {
	console.error(`\n  [${kind}] ${list.length}`);
	for (const { file, key, detail } of list) {
		console.error(`   - ${file} → ${key}`);
		console.error(`     ${detail}`);
	}
}
console.error("\nCf. docs/GLOSSAIRE_REFERENCE.md (orthographe) et docs/I18N_DECISIONS.md (J71-1).");
process.exit(1);
