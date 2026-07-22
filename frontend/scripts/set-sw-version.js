// Injecte un identifiant de build unique dans public/sw.js avant chaque
// `vite build`, pour que le service worker détecte un nouveau cache et
// purge l'ancien à chaque déploiement (voir activate handler dans sw.js).
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = join(__dirname, "..", "public", "sw.js");

const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || Date.now().toString(36);

const content = readFileSync(swPath, "utf8");
const updated = content.replace(/harvests-[A-Za-z0-9_-]+/, `harvests-${buildId}`);

writeFileSync(swPath, updated);
console.log(`[set-sw-version] Service worker cache version set to harvests-${buildId}`);
