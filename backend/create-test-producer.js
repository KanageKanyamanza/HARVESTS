const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

let DB;
if (process.env.DATABASE) {
	DB = process.env.DATABASE.replace(
		"<PASSWORD>",
		process.env.DATABASE_PASSWORD
	);
} else if (process.env.DATABASE_URL) {
	DB = process.env.DATABASE_URL;
} else if (process.env.DATABASE_LOCAL) {
	DB = process.env.DATABASE_LOCAL;
} else {
	DB = "mongodb://localhost:27017/harvests";
}

const TEST_EMAIL = "producteur.test@harvests.dev";
const TEST_PASSWORD = "Test1234!";

console.log(`Using database: ${DB}`);

mongoose
	.connect(DB, {
		serverSelectionTimeoutMS: 5000,
		family: 4,
	})
	.then(async () => {
		console.log("DB connection successful!");

		const existing = await User.findOne({ email: TEST_EMAIL });
		if (existing) {
			existing.password = TEST_PASSWORD;
			existing.isEmailVerified = true;
			existing.isApproved = true;
			existing.isActive = true;
			existing.isProfileComplete = true;
			existing.loginAttempts = 0;
			existing.accountLockedUntil = undefined;
			await existing.save();
			console.log("✅ Compte de test existant mis à jour :");
		} else {
			await User.create({
				firstName: "Producteur",
				lastName: "Test",
				email: TEST_EMAIL,
				password: TEST_PASSWORD,
				phone: "+221770000000",
				userType: "producer",
				farmName: "Ferme Test Harvests",
				country: "Sénégal",
				preferredLanguage: "fr",
				isEmailVerified: true,
				isApproved: true,
				isActive: true,
				isProfileComplete: true,
			});
			console.log("✅ Compte de test créé :");
		}

		console.log(`   Email    : ${TEST_EMAIL}`);
		console.log(`   Password : ${TEST_PASSWORD}`);
		console.log(`   Type     : producer`);

		process.exit();
	})
	.catch((err) => {
		console.log("Error:", err);
		process.exit(1);
	});
