const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

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

console.log(`Using database: ${DB}`);

mongoose
	.connect(DB, {
		serverSelectionTimeoutMS: 5000,
		family: 4,
	})
	.then(async () => {
		console.log("DB connection successful!");

		// Find locked users
		const now = new Date();
		const lockedUsers = await User.find({
			accountLockedUntil: { $gt: now },
		});

		console.log(`Found ${lockedUsers.length} locked users.`);

		if (lockedUsers.length > 0) {
			lockedUsers.forEach((u) =>
				console.log(
					`Unlocking: ${u.email} (Locked until: ${u.accountLockedUntil})`
				)
			);

			const result = await User.updateMany(
				{ accountLockedUntil: { $gt: now } },
				{
					$unset: {
						accountLockedUntil: 1,
						loginAttempts: 1,
					},
				}
			);
			console.log(`✅ Unlocked ${result.modifiedCount} users.`);
		} else {
			console.log("No users currently locked.");

			// Optional: Reset all login attempts just in case
			const attemptsResult = await User.updateMany(
				{ loginAttempts: { $gt: 0 } },
				{ $set: { loginAttempts: 0 } }
			);
			if (attemptsResult.modifiedCount > 0) {
				console.log(
					`ℹ️ Reset login attempts for ${attemptsResult.modifiedCount} users.`
				);
			}
		}

		process.exit();
	})
	.catch((err) => {
		console.log("Error:", err);
		process.exit(1);
	});
