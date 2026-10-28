#!/usr/bin/env node
/**
 * Jour 69 (PWA) — garde-fou du manifeste bilingue.
 *
 * Le manifeste ne sait pas décrire plusieurs langues à la fois : il existe donc
 * un fichier par langue (public/manifest.json en français, public/manifest.en.json
 * en anglais), échangés par utils/i18n.js (applyManifestLanguage). Ce script
 * échoue (code de sortie 1) si les deux versions divergent — une icône ajoutée
 * d'un seul côté, un raccourci oublié, une traduction anglaise encore accentuée —
 * pour que la dette ne s'accumule pas silencieusement, comme
 * check-i18n-parity.js le fait pour src/locales.
 *
 * Usage : node scripts/check-manifest.js
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const MANIFESTS = [
	{ language: "fr", file: "manifest.json" },
	{ language: "en", file: "manifest.en.json" },
];

// Champs qui doivent être identiques dans les deux langues (structure de
// l'application). Seuls name / short_name / description / lang et les textes
// des raccourcis changent.
const SHARED_FIELDS = [
	"start_url",
	"scope",
	"display",
	"orientation",
	"background_color",
	"theme_color",
	"dir",
	"categories",
	"icons",
	"related_applications",
	"prefer_related_applications",
];

const ACCENTED_RE = /[àâäéèêëîïôöùûüçœÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ]/;

const problems = [];
const fail = (message) => problems.push(message);

const loaded = MANIFESTS.map(({ language, file }) => {
	const path = join(PUBLIC_DIR, file);
	try {
		return { language, file, data: JSON.parse(readFileSync(path, "utf8")) };
	} catch (error) {
		fail(`❌ ${file} illisible ou JSON invalide : ${error.message}`);
		return { language, file, data: null };
	}
});

const [frManifest, enManifest] = loaded;

if (frManifest.data && enManifest.data) {
	// 1. Même jeu de champs de premier niveau.
	const frKeys = new Set(Object.keys(frManifest.data));
	const enKeys = new Set(Object.keys(enManifest.data));
	for (const key of frKeys) if (!enKeys.has(key)) fail(`❌ champ « ${key} » présent en fr mais absent en anglais`);
	for (const key of enKeys) if (!frKeys.has(key)) fail(`❌ champ « ${key} » présent en anglais mais absent en fr`);

	// 2. Champs structurels identiques (mêmes icônes, même portée, etc.).
	for (const field of SHARED_FIELDS) {
		const frValue = JSON.stringify(frManifest.data[field]);
		const enValue = JSON.stringify(enManifest.data[field]);
		if (frValue !== enValue) {
			fail(`❌ champ structurel « ${field} » différent entre les deux manifestes\n   fr : ${frValue}\n   en : ${enValue}`);
		}
	}

	// 3. Langue déclarée et textes réellement traduits.
	for (const { language, file, data } of loaded) {
		if (data.lang !== language) {
			fail(`❌ ${file} déclare lang « ${data.lang} » au lieu de « ${language} »`);
		}
		if (!data.name || !data.description) {
			fail(`❌ ${file} : name et description sont obligatoires`);
		}
	}

	for (const field of ["name", "description"]) {
		if (frManifest.data[field] === enManifest.data[field]) {
			fail(`❌ « ${field} » identique dans les deux langues — la version anglaise n'est pas traduite`);
		}
	}

	// 4. Raccourcis : mêmes URL dans le même ordre, textes traduits.
	const frShortcuts = frManifest.data.shortcuts || [];
	const enShortcuts = enManifest.data.shortcuts || [];
	if (frShortcuts.length !== enShortcuts.length) {
		fail(`❌ ${frShortcuts.length} raccourci(s) en fr contre ${enShortcuts.length} en anglais`);
	} else {
		frShortcuts.forEach((frShortcut, index) => {
			const enShortcut = enShortcuts[index] || {};
			if (frShortcut.url !== enShortcut.url) {
				fail(`❌ raccourci #${index + 1} : url « ${enShortcut.url} » en anglais au lieu de « ${frShortcut.url} »`);
			}
			if (JSON.stringify(frShortcut.icons) !== JSON.stringify(enShortcut.icons)) {
				fail(`❌ raccourci « ${frShortcut.url} » : icônes différentes entre les deux langues`);
			}
			for (const field of ["name", "short_name", "description"]) {
				if (!enShortcut[field]) {
					fail(`❌ raccourci « ${frShortcut.url} » : « ${field} » manquant en anglais`);
				} else if (enShortcut[field] === frShortcut[field]) {
					fail(`❌ raccourci « ${frShortcut.url} » : « ${field} » non traduit (« ${frShortcut[field]} »)`);
				}
			}
		});
	}

	// 5. Aucun accent latin ne doit subsister dans la version anglaise
	// (repère simple d'un texte français laissé en place).
	const englishTexts = [
		enManifest.data.name,
		enManifest.data.description,
		...(enManifest.data.shortcuts || []).flatMap((s) => [s.name, s.short_name, s.description]),
	].filter(Boolean);
	englishTexts
		.filter((text) => ACCENTED_RE.test(text))
		.forEach((text) => fail(`❌ texte anglais encore accentué (français ?) : « ${text} »`));
}

if (problems.length > 0) {
	problems.forEach((problem) => console.error(problem));
	console.error("\n💥 Manifestes fr/en désynchronisés — corrige-les avant de builder.");
	process.exit(1);
}

console.log(`✅ Manifestes fr/en cohérents (${MANIFESTS.length} fichiers, ${loaded[0].data.shortcuts.length} raccourci(s)).`);
