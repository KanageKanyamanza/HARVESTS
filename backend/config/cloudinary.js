const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📁 ORGANISATION DES DOSSIERS HARVESTS
const FOLDERS = {
  // Profils utilisateurs
  PROFILES: {
    PRODUCERS: 'harvests/profiles/producers',
    CONSUMERS: 'harvests/profiles/consumers',
    TRANSFORMERS: 'harvests/profiles/transformers',
    RESTAURATEURS: 'harvests/profiles/restaurateurs',
    EXPORTERS: 'harvests/profiles/exporters',
    TRANSPORTERS: 'harvests/profiles/transporters'
  },
  
  // Produits et catalogue
  PRODUCTS: {
    CEREALS: 'harvests/products/cereals',
    VEGETABLES: 'harvests/products/vegetables',
    FRUITS: 'harvests/products/fruits',
    LEGUMES: 'harvests/products/legumes',
    TUBERS: 'harvests/products/tubers',
    SPICES: 'harvests/products/spices',
    PROCESSED: 'harvests/products/processed'
  },
  
  // Documents et certifications
  DOCUMENTS: {
    CERTIFICATIONS: 'harvests/documents/certifications',
    LICENSES: 'harvests/documents/licenses',
    CONTRACTS: 'harvests/documents/contracts'
  },
  
  // Marketing et communication
  MARKETING: {
    BANNERS: 'harvests/marketing/banners',
    PROMOTIONS: 'harvests/marketing/promotions',
    STORIES: 'harvests/marketing/stories'
  },
  
  // Autres
  MISC: {
    TEMP: 'harvests/temp',
    THUMBNAILS: 'harvests/thumbnails'
  }
};

// Storage configurations pour différents types d'images
const createStorage = (folder, transformation = {}) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: {
        quality: 'auto:best',
        fetch_format: 'auto',
        ...transformation
      }
    },
  });
};

// Storages spécialisés
const storages = {
  // Profils utilisateurs - optimisés pour avatars
  profilePicture: createStorage(FOLDERS.PROFILES.PRODUCERS, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face'
  }),
  
  // Images produits - haute qualité
  productImage: createStorage(FOLDERS.PRODUCTS.CEREALS, {
    width: 800,
    height: 600,
    crop: 'fit'
  }),
  
  // Documents - optimisés pour lisibilité
  document: createStorage(FOLDERS.DOCUMENTS.CERTIFICATIONS, {
    quality: 'auto:best',
    format: 'jpg'
  }),
  
  // Banners marketing - grand format
  banner: createStorage(FOLDERS.MARKETING.BANNERS, {
    width: 1200,
    height: 400,
    crop: 'fill'
  })
};

// Fonction pour obtenir le bon dossier selon le type d'utilisateur et contenu
const getFolderPath = (userType, contentType, category = null) => {
  switch (contentType) {
    case 'profile':
      return FOLDERS.PROFILES[userType.toUpperCase()] || FOLDERS.PROFILES.PRODUCERS;
    
    case 'product':
      return FOLDERS.PRODUCTS[category?.toUpperCase()] || FOLDERS.PRODUCTS.CEREALS;
    
    case 'document':
      return FOLDERS.DOCUMENTS.CERTIFICATIONS;
    
    case 'marketing':
      return FOLDERS.MARKETING.BANNERS;
    
    default:
      return FOLDERS.MISC.TEMP;
  }
};

// Fonction pour créer un storage dynamique
const createDynamicStorage = (userType, contentType, category = null) => {
  const folder = getFolderPath(userType, contentType, category);
  
  let transformation = {};
  
  switch (contentType) {
    case 'profile':
      transformation = {
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face'
      };
      break;
    
    case 'product':
      transformation = {
        width: 800,
        height: 600,
        crop: 'fit'
      };
      break;
    
    case 'document':
      transformation = {
        quality: 'auto:best',
        format: 'jpg'
      };
      break;
    
    case 'marketing':
      transformation = {
        width: 1200,
        height: 400,
        crop: 'fill'
      };
      break;
  }
  
  return createStorage(folder, transformation);
};

// Fonction utilitaire pour supprimer une image
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur suppression image Cloudinary:', error);
    throw error;
  }
};

// Fonction pour obtenir une URL optimisée
const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto:best',
    fetch_format: 'auto',
    ...options
  });
};

module.exports = {
  cloudinary,
  storages,
  FOLDERS,
  createStorage,
  createDynamicStorage,
  getFolderPath,
  deleteImage,
  getOptimizedUrl
};
