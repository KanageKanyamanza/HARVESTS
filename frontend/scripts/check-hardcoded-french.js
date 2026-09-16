#!/usr/bin/env node
/**
 * Jour 36 (garde-fous CI) — repère les chaînes françaises codées en dur
 * (texte JSX, ou attributs placeholder/title/alt/aria-label/label) dans les
 * fichiers déjà migrés vers i18next, listés dans i18n-migrated-files.js.
 * Ne scanne QUE cette liste : le reste du frontend est encore en cours de
 * migration progressive (Jours 37-52 du plan bilingue) et contiendrait des
 * centaines de faux positifs attendus. Une fois un fichier migré, l'ajouter
 * à la liste le protège d'une régression future ("la dette revient dès la
 * fonctionnalité suivante").
 *
 * Heuristique volontairement simple (regex, pas de parseur AST) : toute
 * chaîne contenant un caractère accentué latin (é, à, ç...) dans un noeud de
 * texte JSX ou l'un des attributs ci-dessus est signalée. Les lignes
 * commentées et les chaînes passées à t(...) sont ignorées.
 *
 * Usage : node scripts/check-hardcoded-french.js
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { MIGRATED_FILES } from "./i18n-migrated-files.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, "..", "src");

const ACCENTED_RE = /[àâäéèêëîïôöùûüçœÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒ]/;
const ATTR_RE = /\b(?:placeholder|title|alt|aria-label|label)=["']([^"']+)["']/g;
const JSX_TEXT_RE = />([^<>{}\n]+)</g;
const T_CALL_RE = /\bt\(\s*["'`][^"'`]*["'`]/;

let violations = [];

for (const relPath of MIGRATED_FILES) {
	const filePath = join(SRC_DIR, relPath);
	let content;
	try {
		content = readFileSync(filePath, "utf8");
	} catch {
		console.error(`⚠️  Fichier introuvable (à retirer de la liste ?) : ${relPath}`);
		continue;
	}

	const lines = content.split("\n");
	lines.forEach((line, idx) => {
		const trimmed = line.trim();
		if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
		if (T_CALL_RE.test(line)) return; // clé passée à t(), pas du texte en dur

		const candidates = [];
		for (const match of line.matchAll(ATTR_RE)) candidates.push(match[1]);
		for (const match of line.matchAll(JSX_TEXT_RE)) candidates.push(match[1].trim());

		candidates
			.filter((c) => c && ACCENTED_RE.test(c))
			.forEach((c) => {
				violations.push({ file: relPath, line: idx + 1, text: c });
			});
	});
}

if (violations.length > 0) {
	console.error(`❌ ${violations.length} chaîne(s) française(s) codée(s) en dur trouvée(s) :\n`);
	violations.forEach((v) => console.error(`   ${v.file}:${v.line} — "${v.text}"`));
	console.error("\n💥 Ces fichiers sont censés être migrés vers i18next (useTranslation) — passe ce texte par t().");
	process.exit(1);
}

console.log(`✅ Aucun texte français codé en dur dans les ${MIGRATED_FILES.length} fichier(s) migré(s).`);
