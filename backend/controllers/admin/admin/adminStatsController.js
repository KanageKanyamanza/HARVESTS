const Admin = require('../../../models/Admin');
const catchAsync = require('../../../utils/catchAsync');

// @desc    Obtenir les statistiques des administrateurs
// @route   GET /api/v1/admin/admins/stats
// @access  Super Admin, Admin
exports.getAdminStats = catchAsync(async (req, res, next) => {
  const stats = await Admin.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        inactive: {
          $sum: { $cond: ['$isActive', 0, 1] }
        },
        byRole: {
          $push: {
            role: '$role',
            isActive: '$isActive'
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        active: 1,
        inactive: 1,
        superAdmins: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'super-admin'] }
            }
          }
        },
        admins: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'admin'] }
            }
          }
        },
        moderators: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'moderator'] }
            }
          }
        },
        support: {
          $size: {
            $filter: {
              input: '$byRole',
              cond: { $eq: ['$$this.role', 'support'] }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        superAdmins: 0,
        admins: 0,
        moderators: 0,
        support: 0
      }
    }
  });
});

