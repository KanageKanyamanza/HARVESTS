import React from 'react';
import { FiUser, FiEdit3, FiSave, FiX, FiStar } from 'react-icons/fi';
import ProfileImageUpload from '../common/ProfileImageUpload';
import { formatAverageRating } from '../../utils/vendorRatings';

const VENDOR_TYPES = ['producer', 'transformer', 'restaurateur', 'exporter', 'transporter'];

const ProfileHeader = ({
  user,
  avatar,
  editing,
  saving,
  vendorStats,
  vendorStatsLoading,
  onAvatarChange,
  onAvatarRemove,
  onEdit,
  onSave,
  onCancel,
  safeDisplay
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <ProfileImageUpload
                imageType="avatar"
                currentImage={avatar}
                onImageChange={onAvatarChange}
                onImageRemove={onAvatarRemove}
                size="w-24 h-24"
                aspectRatio="1:1"
                className="rounded-full w-24 h-16"
              />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {safeDisplay(user.firstName, '')} {safeDisplay(user.lastName, '')}
              </h2>
              <p className="text-gray-600 capitalize">{user.userType}</p>
              <p className="text-sm text-gray-500">{safeDisplay(user.email, '')}</p>
              {VENDOR_TYPES.includes(user.userType) && (
                <div className="mt-2 flex items-center text-yellow-600 text-sm">
                  <FiStar className="mr-1" />
                  <span className="font-semibold">
                    {formatAverageRating(vendorStats?.averageRating ?? 0)}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {vendorStatsLoading ? 'Calcul...' : `(${vendorStats?.reviewCount ?? 0} avis)`}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap space-x-2">
            {editing ? (
              <>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <FiSave className="mr-2" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={onCancel}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  <FiX className="mr-2" />
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={onEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiEdit3 className="mr-2" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

