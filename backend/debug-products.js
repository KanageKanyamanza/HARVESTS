const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

// Logic from server.js to determine DB string
let DB;
if (process.env.DATABASE) {
	// Production avec mot de passe
	DB = process.env.DATABASE.replace(
		"<PASSWORD>",
		process.env.DATABASE_PASSWORD
	);
} else if (process.env.DATABASE_URL) {
	// Production directe
	DB = process.env.DATABASE_URL;
} else if (process.env.DATABASE_LOCAL) {
	// Développement local
	DB = process.env.DATABASE_LOCAL;
} else {
	// Fallback par défaut
	DB = "mongodb://localhost:27017/harvests";
}

console.log(`Using database: ${DB}`);

mongoose
	.connect(DB, {
		serverSelectionTimeoutMS: 5000,
		family: 4,
	})
	.then(async () => {
		console.log("DB connection successful!");

		console.log("--- DEBUGGING PRODUCTS ---");

		const count = await Product.countDocuments();
		console.log(`Total products: ${count}`);

		// Find all products to inspect their status/active fields
		const allProducts = await Product.find({}, "name status isActive").limit(
			10
		);
		console.log(
			"First 10 products sample:",
			JSON.stringify(allProducts, null, 2)
		);

		// Try finding "tomate"
		const query = "tomates";

		// Test 1: Simple regex on name
		const nameMatch = await Product.find({
			name: { $regex: query, $options: "i" },
		});
		console.log(`Matches by name only (tomates): ${nameMatch.length}`);

		// Test 2: 'tomate' singular
		const singleMatch = await Product.find({
			name: { $regex: "tomate", $options: "i" },
		});
		console.log(`Matches by name (tomate): ${singleMatch.length}`);

		// Test 3: Full detailed query like in controller
		const fullQuery = await Product.find({
			$or: [
				{ name: { $regex: "tomate", $options: "i" } }, // using singular for broader match test
				{ description: { $regex: "tomate", $options: "i" } },
				{ tags: { $in: [new RegExp("tomate", "i")] } },
			],
			isActive: true,
			status: "approved",
		});
		console.log(`Full query matches (tomate): ${fullQuery.length}`);

		if (fullQuery.length === 0) {
			console.log("Checking why full query failed...");
			const potentialMatches = await Product.find({
				$or: [
					{ name: { $regex: "tomate", $options: "i" } },
					{ description: { $regex: "tomate", $options: "i" } },
				],
			});
			console.log(
				`Potential matches ignoring active/status check: ${potentialMatches.length}`
			);
			if (potentialMatches.length > 0) {
				console.log(
					"First potential match:",
					JSON.stringify(potentialMatches[0], null, 2)
				);
			}
		}

		process.exit();
	})
	.catch((err) => {
		console.log("Error:", err);
		process.exit(1);
	});
