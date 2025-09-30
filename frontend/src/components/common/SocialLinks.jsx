import React from 'react';
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa';

const SocialLinks = ({ 
  variant = 'default', 
  size = 'md', 
  className = '',
  showLabels = false,
  links = {}
}) => {
  // Configuration des réseaux sociaux
  const socialNetworks = [
    {
      name: 'Instagram', 
      icon: FaInstagram,
      url: links.instagram || 'https://www.instagram.com/ubb1957_?igsh=MW8xdDlsMGRzM2Jidg==',
      color: '#E4405F',
      hoverColor: '#D62D51'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: links.linkedin || 'https://www.linkedin.com/in/ubuntu-business-builders-113223363?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
      color: '#0A66C2',
      hoverColor: '#004182'
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: links.tiktok || 'https://www.tiktok.com/@ubb545?_t=ZN-8vKxXkXQe4g&_r=1',
      color: '#000000',
      hoverColor: '#333333'
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: links.youtube || 'https://youtube.com/@ubuntubusinessbuilders?si=NL3IMhyHoM06UCC2',
      color: '#FF0000',
      hoverColor: '#CC0000'
    }
  ];

  // Tailles des icônes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  // Variantes de style
  const getVariantClasses = () => {
    switch (variant) {
      case 'colored':
        return `text-black shadow-md hover:shadow-lg transform hover:scale-105`;
      
      case 'outline':
        return `border-2 text-gray-600 hover:text-white bg-transparent hover:shadow-md`;
      
      case 'minimal':
        return `text-gray-500 hover:text-gray-700 bg-transparent`;
      
      case 'glass':
        return `bg-white/20 backdrop-blur-sm text-black hover:bg-white/30 border border-white/20`;
      
      default:
        return `bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
    }
  };

  const getBackgroundStyle = (network) => {
    if (variant === 'colored') {
      return { backgroundColor: network.color };
    }
    if (variant === 'outline') {
      return { borderColor: network.color };
    }
    return {};
  };

  const getHoverStyle = (network) => {
    if (variant === 'colored') {
      return { backgroundColor: network.hoverColor };
    }
    if (variant === 'outline') {
      return { 
        borderColor: network.color,
        backgroundColor: network.color 
      };
    }
    return {};
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {socialNetworks.map((network) => {
        const Icon = network.icon;
        
        return (
          <a
            key={network.name}
            href={network.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${sizeClasses[size]} 
              ${getVariantClasses()}
              rounded-lg flex items-center justify-center 
              transition-all duration-200 
              group relative
              ${showLabels ? 'flex-col space-y-1 p-2' : ''}
            `}
            style={getBackgroundStyle(network)}
            onMouseEnter={(e) => {
              if (variant === 'colored' || variant === 'outline') {
                Object.assign(e.target.style, getHoverStyle(network));
              }
            }}
            onMouseLeave={(e) => {
              if (variant === 'colored' || variant === 'outline') {
                Object.assign(e.target.style, getBackgroundStyle(network));
              }
            }}
            title={network.name}
          >
            <Icon className={iconSizes[size]} />
            
            {showLabels && (
              <span className="text-xs font-medium">{network.name}</span>
            )}
            
            {/* Tooltip pour les variantes sans labels */}
            {!showLabels && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {network.name}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
};

// Variantes prédéfinies pour usage rapide
export const SocialLinksColored = (props) => (
  <SocialLinks variant="colored" {...props} />
);

export const SocialLinksOutline = (props) => (
  <SocialLinks variant="outline" {...props} />
);

export const SocialLinksMinimal = (props) => (
  <SocialLinks variant="minimal" {...props} />
);

export const SocialLinksGlass = (props) => (
  <SocialLinks variant="glass" {...props} />
);

export default SocialLinks;
