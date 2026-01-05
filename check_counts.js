const mongoose = require("mongoose");
require("dotenv").config();

async function checkCounts() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		const User = require("./backend/models/User");
		const counts = await User.aggregate([
			{ $group: { _id: "$userType", count: { $sum: 1 } } },
		]);
		console.log("User counts by type:");
		console.log(JSON.stringify(counts, null, 2));

		const total = await User.countDocuments();
		console.log("Total users:", total);

		const isActive = await User.countDocuments({ isActive: true });
		console.log("Active users:", isActive);

		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

checkCounts();
