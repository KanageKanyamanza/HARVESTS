const TranslationGlossary = require("../../models/TranslationGlossary");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { invalidateGlossaryCache } = require("../../utils/translationGlossary");
const { logAudit, AUDIT_ACTIONS } = require("../../utils/auditLogger");

// Jour 46 (bascule bilingue) - gestion du glossaire de traduction fr->en
// depuis le back-office (cf models/TranslationGlossary.js).

const EDITABLE_FIELDS = ["type", "source", "target", "flags", "note"];

function pickEditable(body) {
	const data = {};
	for (const field of EDITABLE_FIELDS) {
		if (body[field] !== undefined) data[field] = body[field];
	}
	return data;
}

function escapeRegex(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Doublon sur l'index unique {type, source} -> message lisible plutôt qu'un 500
function duplicateError(error) {
	if (error?.code === 11000) {
		return new AppError("Cette entrée existe déjà dans le glossaire", 409);
	}
	return error;
}

// @desc    Lister les entrées du glossaire
// @route   GET /api/v1/admin/glossary
// @access  Admin
exports.getGlossaryEntries = catchAsync(async (req, res, next) => {
	const { type, search } = req.query;

	const filter = {};
	if (type === "exact" || type === "replacement") {
		filter.type = type;
	}
	if (search) {
		const pattern = { $regex: escapeRegex(String(search)), $options: "i" };
		filter.$or = [{ source: pattern }, { target: pattern }, { note: pattern }];
	}

	const entries = await TranslationGlossary.find(filter)
		.sort({ type: 1, source: 1 })
		.lean();

	res.status(200).json({
		status: "success",
		results: entries.length,
		data: { entries },
	});
});

// @desc    Ajouter une entrée au glossaire
// @route   POST /api/v1/admin/glossary
// @access  Admin
exports.createGlossaryEntry = catchAsync(async (req, res, next) => {
	let entry;
	try {
		entry = await TranslationGlossary.create({
			...pickEditable(req.body),
			createdBy: req.admin._id,
			updatedBy: req.admin._id,
		});
	} catch (error) {
		return next(duplicateError(error));
	}

	invalidateGlossaryCache();

	await logAudit({
		userId: req.admin._id,
		userEmail: req.admin.email,
		action: AUDIT_ACTIONS.GLOSSARY_ENTRY_CREATED,
		targetType: "TranslationGlossary",
		targetId: entry._id,
		details: { type: entry.type, source: entry.source, target: entry.target },
	});

	res.status(201).json({ status: "success", data: { entry } });
});

// @desc    Modifier une entrée du glossaire
// @route   PATCH /api/v1/admin/glossary/:id
// @access  Admin
exports.updateGlossaryEntry = catchAsync(async (req, res, next) => {
	const entry = await TranslationGlossary.findById(req.params.id);
	if (!entry) {
		return next(new AppError("Entrée du glossaire non trouvée", 404));
	}

	const before = { type: entry.type, source: entry.source, target: entry.target };

	// save() plutôt que findByIdAndUpdate : les hooks pre("validate")
	// (normalisation des termes exacts, contrôle de la regex) doivent tourner
	entry.set({ ...pickEditable(req.body), updatedBy: req.admin._id });
	try {
		await entry.save();
	} catch (error) {
		return next(duplicateError(error));
	}

	invalidateGlossaryCache();

	await logAudit({
		userId: req.admin._id,
		userEmail: req.admin.email,
		action: AUDIT_ACTIONS.GLOSSARY_ENTRY_UPDATED,
		targetType: "TranslationGlossary",
		targetId: entry._id,
		details: {
			before,
			after: { type: entry.type, source: entry.source, target: entry.target },
		},
	});

	res.status(200).json({ status: "success", data: { entry } });
});

// @desc    Supprimer une entrée du glossaire
// @route   DELETE /api/v1/admin/glossary/:id
// @access  Admin
exports.deleteGlossaryEntry = catchAsync(async (req, res, next) => {
	const entry = await TranslationGlossary.findByIdAndDelete(req.params.id);
	if (!entry) {
		return next(new AppError("Entrée du glossaire non trouvée", 404));
	}

	invalidateGlossaryCache();

	await logAudit({
		userId: req.admin._id,
		userEmail: req.admin.email,
		action: AUDIT_ACTIONS.GLOSSARY_ENTRY_DELETED,
		targetType: "TranslationGlossary",
		targetId: entry._id,
		details: { type: entry.type, source: entry.source, target: entry.target },
	});

	res.status(200).json({ status: "success", data: null });
});
