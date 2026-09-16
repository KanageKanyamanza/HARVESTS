#!/usr/bin/env node
/**
 * Jour 36 (garde-fous CI) — compare chaque paire fr/{ns}.json et en/{ns}.json
 * et échoue (code de sortie 1) si une clé manque d'un côté. Branché sur
 * `npm run build` pour que la dette de traduction casse le build plutôt que
 * de s'accumuler silencieusement.
 *
 * Usage : node scripts/check-i18n-parity.js
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "..", "src", "locales");

function flattenKeys(obj, prefix = "") {
	return Object.entries(obj).flatMap(([key, value]) => {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (value !== null && typeof value === "object" && !Array.isArray(value)) {
			return flattenKeys(value, fullKey);
		}
		return [fullKey];
	});
}

function loadKeys(locale, namespace) {
	const filePath = join(LOCALES_DIR, locale, `${namespace}.json`);
	const content = JSON.parse(readFileSync(filePath, "utf8"));
	return new Set(flattenKeys(content));
}

const namespaces = readdirSync(join(LOCALES_DIR, "fr"))
	.filter((f) => f.endsWith(".json"))
	.map((f) => f.replace(/\.json$/, ""));

let hasMismatch = false;

for (const ns of namespaces) {
	const enPath = join(LOCALES_DIR, "en", `${ns}.json`);
	if (!existsSync(enPath)) {
		console.error(`❌ [${ns}] namespace présent en fr mais absent en en/${ns}.json`);
		hasMismatch = true;
		continue;
	}

	const frKeys = loadKeys("fr", ns);
	const enKeys = loadKeys("en", ns);

	const missingInEn = [...frKeys].filter((k) => !enKeys.has(k));
	const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));

	if (missingInEn.length > 0) {
		hasMismatch = true;
		console.error(`❌ [${ns}] clé(s) manquante(s) dans en/${ns}.json :`);
		missingInEn.forEach((k) => console.error(`   - ${k}`));
	}
	if (missingInFr.length > 0) {
		hasMismatch = true;
		console.error(`❌ [${ns}] clé(s) manquante(s) dans fr/${ns}.json :`);
		missingInFr.forEach((k) => console.error(`   - ${k}`));
	}
}

if (hasMismatch) {
	console.error("\n💥 Parité fr/en rompue — corrige les clés ci-dessus avant de builder.");
	process.exit(1);
}

console.log(`✅ Parité fr/en OK sur ${namespaces.length} namespace(s).`);
