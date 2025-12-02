const multer = require('multer');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

// Configuration Multer pour les pièces jointes
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Type de fichier non autorisé', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 5
  }
});

exports.uploadAttachments = upload.array('attachments', 5);

// Middleware pour traiter les pièces jointes
exports.processAttachments = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.body.attachments = [];

  for (const file of req.files) {
    const filename = `msg-${req.user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Déterminer le type
    let type = 'document';
    if (file.mimetype.startsWith('image/')) type = 'image';
    else if (file.mimetype.startsWith('video/')) type = 'video';
    else if (file.mimetype.startsWith('audio/')) type = 'audio';

    req.body.attachments.push({
      type,
      filename: `${filename}.${file.mimetype.split('/')[1]}`,
      originalName: file.originalname,
      url: `/uploads/messages/${filename}`,
      size: file.size,
      mimeType: file.mimetype
    });
  }

  next();
});

