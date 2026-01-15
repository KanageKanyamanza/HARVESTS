const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User"); // Need a producer ID

dotenv.config();

// Logic from server.js to determine DB string
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

mongoose
	.connect(DB, {
		serverSelectionTimeoutMS: 5000,
		family: 4,
	})
	.then(async () => {
		console.log("DB connection successful!");

		// Find a producer
		const producer = await User.findOne({ role: "producer" });
		if (!producer) {
			console.log("No producer found, creating one...");
			// Handle creation if needed, but usually there is one in dummy data.
			// If not, we might fail to create product due to required field.
		}
		const producerId = producer ? producer._id : new mongoose.Types.ObjectId();

		const newProduct = {
			name: "Tomates Bio",
			description:
				"De délicieuses tomates biologiques cultivées sans pesticides.",
			shortDescription: "Tomates fraîches et bio",
			category: "vegetables",
			price: 1500,
			unit: "kg",
			producer: producerId,
			userType: "producer",
			images: [
				{
					url: "https://res.cloudinary.com/harvests/image/upload/v1/products/tomates.jpg",
					alt: "Tomates Rouges",
					isPrimary: true,
				},
			],
			status: "approved",
			isActive: true,
			inventory: {
				quantity: 100,
			},
			tags: ["tomate", "bio", "légume", "frais"],
		};

		try {
			const created = await Product.create(newProduct);
			console.log("✅ Created product:", created.name);
		} catch (e) {
			console.error("❌ Error creating product:", e.message);
		}

		process.exit();
	})
	.catch((err) => {
		console.log("Error:", err);
		process.exit(1);
	});
