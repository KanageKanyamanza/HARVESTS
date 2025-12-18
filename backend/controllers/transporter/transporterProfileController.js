const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Transporter = require("../../models/Transporter");

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id);
	res.status(200).json({ status: "success", data: { transporter } });
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
	const allowedFields = [
		"firstName",
		"lastName",
		"phone",
		"email",
		"companyName",
		"transportType",
		"serviceTypes",
		"serviceAreas",
		"tradingTerms",
		"pricingStructure",
		"address",
		"city",
		"region",
		"country",
		"postalCode",
		"bio",
		"biography",
		"operatingHours",
		"avatar",
		"shopBanner",
		"shopLogo",
	];

	const filteredBody = {};
	Object.keys(req.body).forEach((key) => {
		if (allowedFields.includes(key)) {
			filteredBody[key] = req.body[key];
		}
	});

	// Filtrer les valeurs undefined/null/vides
	Object.keys(filteredBody).forEach((key) => {
		if (
			filteredBody[key] === undefined ||
			filteredBody[key] === null ||
			filteredBody[key] === ""
		) {
			delete filteredBody[key];
		}
	});

	const transporter = await Transporter.findByIdAndUpdate(
		req.user.id,
		filteredBody,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!transporter) {
		return next(new AppError("Transporteur non trouvé", 404));
	}

	res.status(200).json({ status: "success", data: { transporter } });
});

// Gestion de la flotte
exports.getMyFleet = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id).select("fleet");
	res.status(200).json({
		status: "success",
		results: transporter.fleet.length,
		data: { fleet: transporter.fleet },
	});
});

exports.addVehicle = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id);

	const vehicleData = {
		vehicleType: req.body.vehicleType,
		registrationNumber: req.body.registrationNumber,
		capacity: req.body.capacity,
		specialFeatures: req.body.specialFeatures || [],
		condition: req.body.condition || "good",
		isAvailable:
			req.body.isAvailable !== undefined ? req.body.isAvailable : true,
		lastMaintenanceDate: req.body.lastMaintenanceDate
			? new Date(req.body.lastMaintenanceDate)
			: undefined,
		nextMaintenanceDate: req.body.nextMaintenanceDate
			? new Date(req.body.nextMaintenanceDate)
			: undefined,
		image: req.body.image
			? {
					url: req.body.image.url,
					publicId: req.body.image.publicId,
					alt: req.body.image.alt || "Véhicule",
			  }
			: undefined,
	};

	Object.keys(vehicleData).forEach((key) => {
		if (vehicleData[key] === undefined) {
			delete vehicleData[key];
		}
	});

	transporter.fleet.push(vehicleData);
	await transporter.save();

	res.status(201).json({
		status: "success",
		data: { vehicle: transporter.fleet[transporter.fleet.length - 1] },
	});
});

exports.updateVehicle = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id);
	const vehicle = transporter.fleet.id(req.params.vehicleId);

	if (!vehicle) return next(new AppError("Véhicule non trouvé", 404));

	const allowedFields = [
		"vehicleType",
		"registrationNumber",
		"capacity",
		"specialFeatures",
		"condition",
		"isAvailable",
		"lastMaintenanceDate",
		"nextMaintenanceDate",
		"image",
	];

	Object.keys(req.body).forEach((key) => {
		if (allowedFields.includes(key)) {
			if (key === "lastMaintenanceDate" || key === "nextMaintenanceDate") {
				vehicle[key] = req.body[key] ? new Date(req.body[key]) : undefined;
			} else if (key === "image") {
				if (req.body.image === null) {
					vehicle.image = undefined;
				} else if (req.body.image && req.body.image.url) {
					vehicle.image = {
						url: req.body.image.url,
						publicId: req.body.image.publicId || null,
						alt: req.body.image.alt || "Véhicule",
					};
				}
			} else {
				vehicle[key] = req.body[key];
			}
		}
	});

	await transporter.save();
	res.status(200).json({ status: "success", data: { vehicle } });
});

exports.removeVehicle = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id);
	transporter.fleet.pull(req.params.vehicleId);
	await transporter.save();
	res.status(204).json({ status: "success", data: null });
});

exports.updateVehicleAvailability = catchAsync(async (req, res, next) => {
	const transporter = await Transporter.findById(req.user.id);
	const vehicle = transporter.fleet.id(req.params.vehicleId);

	if (!vehicle) return next(new AppError("Véhicule non trouvé", 404));

	vehicle.isAvailable = req.body.isAvailable;
	await transporter.save();

	res.status(200).json({
		status: "success",
		data: { vehicle },
	});
});
