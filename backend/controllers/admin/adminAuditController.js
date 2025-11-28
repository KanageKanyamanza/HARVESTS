const AuditLog = require('../../models/AuditLog');
const catchAsync = require('../../utils/catchAsync');

// @desc    Obtenir les logs d'audit
// @route   GET /api/v1/admin/audit-logs
// @access  Admin
exports.getAuditLogs = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 50, 
    action, 
    userId, 
    startDate, 
    endDate,
    status 
  } = req.query;

  const filter = {};
  
  if (action) filter.action = action;
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName email')
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    data: {
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalLogs: total
      }
    }
  });
});

