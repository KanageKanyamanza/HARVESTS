const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Exporter = require("../../models/Exporter");

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	res.status(200).json({ status: "success", data: { exporter } });
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
	const allowedFields = [
		"firstName",
		"lastName",
		"phone",
		"email",
		"address",
		"city",
		"region",
		"country",
		"companyName",
		"bio",
		"targetMarkets",
		"exportProducts",
		"tradingTerms",
		"internationalCertifications",
		"logisticsCapabilities",
		"operatingHours",
	];
	const filteredBody = {};
	Object.keys(req.body).forEach((key) => {
		if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
	});

	const exporter = await Exporter.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ status: "success", data: { exporter } });
});

// Gestion des licences d'exportation
exports.getExportLicenses = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id).select(
		"exportLicenses"
	);
	res.status(200).json({
		status: "success",
		results: exporter.exportLicenses.length,
		data: { licenses: exporter.exportLicenses },
	});
});

exports.addExportLicense = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	const licenseData = { ...req.body };
	if (req.file) licenseData.document = req.file.filename;

	exporter.exportLicenses.push(licenseData);
	await exporter.save();

	res.status(201).json({
		status: "success",
		data: {
			license: exporter.exportLicenses[exporter.exportLicenses.length - 1],
		},
	});
});

exports.updateExportLicense = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	const license = exporter.exportLicenses.id(req.params.licenseId);

	if (!license) return next(new AppError("Licence non trouvée", 404));

	Object.keys(req.body).forEach((key) => {
		license[key] = req.body[key];
	});

	await exporter.save();
	res.status(200).json({ status: "success", data: { license } });
});

exports.removeExportLicense = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	exporter.exportLicenses.pull(req.params.licenseId);
	await exporter.save();
	res.status(204).json({ status: "success", data: null });
});

// Gestion de la flotte d'export
exports.getMyFleet = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id).select("fleet");
	res.status(200).json({
		status: "success",
		results: exporter.fleet.length,
		data: { fleet: exporter.fleet },
	});
});

exports.addVehicle = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	exporter.fleet.push(req.body);
	await exporter.save();

	res.status(201).json({
		status: "success",
		data: { vehicle: exporter.fleet[exporter.fleet.length - 1] },
	});
});

exports.updateVehicle = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	const vehicle = exporter.fleet.id(req.params.vehicleId);

	if (!vehicle) return next(new AppError("Véhicule non trouvé", 404));

	Object.keys(req.body).forEach((key) => {
		vehicle[key] = req.body[key];
	});

	await exporter.save();
	res.status(200).json({ status: "success", data: { vehicle } });
});

exports.removeVehicle = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	exporter.fleet.pull(req.params.vehicleId);
	await exporter.save();
	res.status(204).json({ status: "success", data: null });
});

exports.updateVehicleAvailability = catchAsync(async (req, res, next) => {
	const exporter = await Exporter.findById(req.user.id);
	const vehicle = exporter.fleet.id(req.params.vehicleId);

	if (!vehicle) return next(new AppError("Véhicule non trouvé", 404));

	vehicle.isAvailable =
		req.body.isAvailable !== undefined
			? req.body.isAvailable
			: vehicle.isAvailable;
	await exporter.save();

	res.status(200).json({
		status: "success",
		data: { vehicle },
	});
});
