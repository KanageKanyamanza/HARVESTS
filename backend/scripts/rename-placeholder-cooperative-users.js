#!/usr/bin/env node
/**
 * Renomme les comptes producteurs de la coopérative wendpenga dont le
 * prénom/nom est resté au placeholder "À compléter" à l'inscription.
 * Utilise le préfixe de l'email (avant le @, chiffres de désambiguïsation
 * retirés) comme prénom provisoire, pour que ces comptes ne s'affichent
 * plus avec un nom vide dans les listings publics (bandeau, page /producteurs).
 * Usage: node scripts/rename-placeholder-cooperative-users.js
 */
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const connectDB = async () => {
	let mongoURI;
	if (process.env.DATABASE) {
		mongoURI = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
	} else if (process.env.DATABASE_URL) {
		mongoURI = process.env.DATABASE_URL;
	} else if (process.env.DATABASE_LOCAL) {
		mongoURI = process.env.DATABASE_LOCAL;
	} else {
		mongoURI = "mongodb://localhost:27017/harvests";
	}
	await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000, family: 4 });
};

const nameFromEmail = (email) => {
	const prefix = email.split("@")[0].replace(/\d+$/, "");
	return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
};

const main = async () => {
	try {
		await connectDB();
		const users = await User.find({
			firstName: "À compléter",
			farmName: /coop[ée]rative/i,
		}).select("firstName lastName email");

		console.log(`\n${users.length} compte(s) à renommer\n`);
		for (const u of users) {
			const newFirstName = nameFromEmail(u.email);
			await User.updateOne({ _id: u._id }, { $set: { firstName: newFirstName } });
			console.log(`${u.email} -> firstName="${newFirstName}"`);
		}
	} catch (e) {
		console.error("Erreur:", e.message);
		process.exitCode = 1;
	} finally {
		await mongoose.connection.close();
	}
};

main();
