import React from 'react';
import { FiAward, FiStar, FiShield, FiZap } from 'react-icons/fi';

const Badge = ({ 
  type = 'verified', 
  size = 'medium', 
  showLabel = true, 
  className = '' 
}) => {
  const badgeConfigs = {
    verified: {
      icon: FiShield,
      label: 'Vérifié',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600'
    },
    premium: {
      icon: FiStar,
      label: 'Premium',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    gold: {
      icon: FiAward,
      label: 'Gold',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      iconColor: 'text-yellow-600'
    },
    platinum: {
      icon: FiAward,
      label: 'Platinum',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      iconColor: 'text-gray-600'
    },
    diamond: {
      icon: FiZap,
      label: 'Diamond',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600'
    }
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const config = badgeConfigs[type] || badgeConfigs.verified;
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${config.color}
      ${sizeClasses[size]}
      ${className}
    `}>
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

export default Badge;
