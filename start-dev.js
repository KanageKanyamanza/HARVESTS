#!/usr/bin/env node

/**
 * Script pour démarrer le backend et frontend en développement
 */

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Démarrage de Harvests en mode développement...\n");

// Fonction pour démarrer un processus
function startProcess(name, command, args, cwd) {
	console.log(`📦 Démarrage ${name}...`);

	const process = spawn(command, args, {
		cwd: path.join(__dirname, cwd),
		stdio: "inherit",
		shell: true,
	});

	process.on("error", (err) => {
		console.error(`❌ Erreur ${name}:`, err);
	});

	process.on("close", (code) => {
		console.log(`🔴 ${name} arrêté avec le code ${code}`);
	});

	return process;
}

// Démarrer le backend sur le port 8001 avec nodemon
const backend = startProcess(
	"Backend (Port 8001)",
	"npx",
	["nodemon", "server.js"],
	"backend",
);

// Attendre un peu avant de démarrer le frontend
let frontend;
setTimeout(() => {
	// Démarrer le frontend sur le port 5173
	frontend = startProcess(
		"Frontend (Port 5173)",
		"npm",
		["run", "dev"],
		"frontend",
	);
}, 2000);

// Gestion de l'arrêt propre
process.on("SIGINT", () => {
	console.log("\n🛑 Arrêt des serveurs...");
	backend.kill();
	if (frontend && typeof frontend.kill === "function") {
		frontend.kill();
	}
	process.exit(0);
});

console.log(`
🌾 Harvests - Mode Développement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Backend API: http://localhost:5000
🌐 Frontend:    http://localhost:5173
📚 API Docs:    http://localhost:5000/api-docs

💡 Appuyez sur Ctrl+C pour arrêter les serveurs
`);
