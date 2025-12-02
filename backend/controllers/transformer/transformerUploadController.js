const multer = require('multer');
const AppError = require('../../utils/appError');

// Configuration Multer
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Veuillez télécharger uniquement des images ou des PDF!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCertificationDocument = upload.single('document');
exports.uploadDocument = upload.single('document');
exports.uploadQualityReport = upload.single('report');
exports.uploadMaintenanceDocument = upload.single('document');

