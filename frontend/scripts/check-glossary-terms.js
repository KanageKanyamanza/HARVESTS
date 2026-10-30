#!/usr/bin/env node
/**
 * Jour 70 (lexique de référence) — garde-fou CI du glossaire métier figé dans
 * docs/GLOSSAIRE_REFERENCE.md. Échoue (code de sortie 1) si une valeur des
 * locales anglaises emploie un terme que le glossaire proscrit, pour que la
 * terminologie ne se re-désynchronise pas au fil des traductions.
 *
 * Ne regarde que les VALEURS (jamais les clés : `transformer`, `transporter`,
 * `transformerProfile`… restent valides côté code).
 *
 * Usage : node scripts/check-glossary-terms.js
 */
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EN_LOCALES_DIR = join(__dirname, "..", "src", "locales", "en");

// Terme proscrit -> terme retenu par le glossaire (avec la raison).
const FORBIDDEN = [
	{
		pattern: /\btransformers?\b/i,
		expected: "processor",
		reason: "rôle « transformateur » : « transformer » est ambigu en anglais",
	},
	{
		pattern: /\btransporters?\b/i,
		expected: "carrier",
		reason: "rôle « transporteur » : « transporter » désigne un engin en anglais",
	},
];

function walk(value, path, file, violations) {
	if (typeof value === "string") {
		for (const rule of FORBIDDEN) {
			if (rule.pattern.test(value)) {
				violations.push({ file, key: path, value, rule });
			}
		}
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => walk(item, `${path}[${index}]`, file, violations));
		return;
	}
	if (value && typeof value === "object") {
		for (const [key, item] of Object.entries(value)) {
			walk(item, path ? `${path}.${key}` : key, file, violations);
		}
	}
}

const violations = [];
for (const file of readdirSync(EN_LOCALES_DIR).filter((f) => f.endsWith(".json"))) {
	const content = JSON.parse(readFileSync(join(EN_LOCALES_DIR, file), "utf8"));
	walk(content, "", file, violations);
}

if (violations.length === 0) {
	console.log(
		`✅ Glossaire respecté (${FORBIDDEN.length} terme(s) proscrit(s) vérifié(s) dans en/*.json).`,
	);
	process.exit(0);
}

console.error(`❌ ${violations.length} valeur(s) hors glossaire (cf docs/GLOSSAIRE_REFERENCE.md) :`);
for (const { file, key, value, rule } of violations) {
	console.error(`   - en/${file} → ${key}`);
	console.error(`     « ${value} » → utiliser « ${rule.expected} » (${rule.reason})`);
}
process.exit(1);
