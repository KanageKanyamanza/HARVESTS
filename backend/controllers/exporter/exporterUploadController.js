const multer = require('multer');
const AppError = require('../../utils/appError');

// Configuration Multer
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('exporter.upload_type_not_allowed', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadLicenseDocument = upload.single('document');
exports.uploadCertificationDocument = upload.single('document');
exports.uploadInsuranceDocument = upload.single('document');
exports.uploadExportDocument = upload.single('document');
exports.uploadDocument = upload.single('document');

